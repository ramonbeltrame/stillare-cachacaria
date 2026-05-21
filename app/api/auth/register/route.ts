import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { sendWelcomeEmail } from "@/lib/email-service";
import { calculateAge } from "@/lib/utils";
import { registerRateLimit, getClientIp, sanitizeInput, rateLimitResponse, containsDangerousContent } from "@/lib/security";
import bcrypt from "bcryptjs";
import crypto from "crypto";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = registerRateLimit(ip);
    if (!rl.success) return rateLimitResponse(rl.resetAt);

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, fullName, phone, dateOfBirth, cpf } = parsed.data;

    const safeEmail = sanitizeInput(email);
    const safeFullName = sanitizeInput(fullName);

    if (containsDangerousContent(safeEmail) || containsDangerousContent(safeFullName)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado" },
        { status: 409 }
      );
    }

    if (cpf) {
      const existingCpf = await prisma.user.findUnique({ where: { cpf } });
      if (existingCpf) {
        return NextResponse.json(
          { error: "Este CPF já está cadastrado" },
          { status: 409 }
        );
      }
    }

    const birthDate = new Date(dateOfBirth);
    const age = calculateAge(birthDate);
    if (age < 18) {
      return NextResponse.json(
        { error: "Você deve ter 18 anos ou mais para se cadastrar" },
        { status: 403 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const emailVerifyToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone: phone || null,
        dateOfBirth: birthDate,
        cpf: cpf || null,
        emailVerifyToken,
      },
    });

    await prisma.ageVerificationLog.create({
      data: {
        userId: user.id,
        calculatedAge: age,
        isEligible: true,
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
        userAgent: request.headers.get("user-agent") || null,
        confirmedAt: new Date(),
      },
    });

    sendWelcomeEmail(user.id).catch((err) =>
      console.error("Failed to send welcome email:", err)
    );

    const { passwordHash: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar cadastro" },
      { status: 500 }
    );
  }
}
