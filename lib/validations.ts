import { z } from "zod";

function validarCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === parseInt(cleaned[10]);
}

export const registerSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Deve conter letras maiúsculas, minúsculas e números"
    ),
  fullName: z.string().min(3, "Nome muito curto"),
  phone: z.string().optional(),
  dateOfBirth: z.string().refine(
    (date) => {
      const today = new Date();
      const birth = new Date(date);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return age >= 18;
    },
    "Você deve ter 18 anos ou mais para se cadastrar"
  ),
  cpf: z
    .string()
    .min(1, "CPF obrigatório")
    .refine((cpf) => validarCPF(cpf), "CPF inválido"),
});

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

export const addressSchema = z.object({
  recipientName: z.string().min(3, "Nome do destinatário obrigatório"),
  phone: z.string().optional(),
  street: z.string().min(3, "Rua obrigatória"),
  number: z.string().min(1, "Número obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().length(2, "Estado (UF) obrigatório"),
  zipCode: z.string().min(8, "CEP obrigatório"),
  isDefault: z.boolean().optional(),
});

export const productSchema = z.object({
  categoryId: z.string().min(1, "Categoria obrigatória"),
  name: z.string().min(3, "Nome obrigatório"),
  slug: z.string().min(3, "Slug obrigatório"),
  sku: z.string().min(1, "SKU obrigatório"),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  price: z.number().positive("Preço deve ser positivo"),
  costPrice: z.number().positive().optional(),
  stock: z.number().int().min(0),
  reorderLevel: z.number().int().min(0).default(10),
  ncm: z.string().default("2208.90.00"),
  cfop: z.string().default("5102"),
  volumeMl: z.number().int().positive().optional(),
  alcoholPercentage: z.number().positive().optional(),
  weightGrams: z.number().int().positive().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  slug: z.string().min(2, "Slug obrigatório"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export const checkoutSchema = z.object({
  shippingAddressId: z.string().min(1, "Endereço de entrega obrigatório"),
  shippingMethod: z.string().min(1, "Método de envio obrigatório"),
  ageConfirmed: z.literal(true, {
    errorMap: () => ({ message: "Você deve confirmar que tem 18 anos ou mais" }),
  }),
  customerNotes: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Deve conter letras maiúsculas, minúsculas e números"
    ),
});

export const profileSchema = z.object({
  fullName: z.string().min(3, "Nome muito curto"),
  phone: z.string().optional(),
});

export const shippingCalculateSchema = z.object({
  zipCode: z.string().min(8, "CEP obrigatório"),
  items: z.array(
    z.object({
      weightGrams: z.number().int().positive(),
      quantity: z.number().int().positive(),
    })
  ),
});
