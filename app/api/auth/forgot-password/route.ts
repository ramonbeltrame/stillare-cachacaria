import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import { sendPasswordResetEmail } from "@/lib/email-service";
import { forgotPasswordRateLimit, getClientIp, rateLimitResponse } from "@/lib/security";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = forgotPasswordRateLimit(ip);
    if (!rl.success) return rateLimitResponse(rl.resetAt);
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "E-mail inválido", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpiry: resetExpiry,
        },
      });

      sendPasswordResetEmail(user.id, resetToken).catch((err) =>
        console.error("Failed to send password reset email:", err)
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ success: true });
  }
}
