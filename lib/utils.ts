import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `PED-${year}${month}${random}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Pendente",
    PAID: "Pago",
    PROCESSING: "Em Processamento",
    SHIPPED: "Enviado",
    DELIVERED: "Entregue",
    CANCELLED: "Cancelado",
    REFUNDED: "Reembolsado",
  };
  return labels[status] || status;
}

export function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Pendente",
    APPROVED: "Aprovado",
    FAILED: "Recusado",
    REFUNDED: "Reembolsado",
  };
  return labels[status] || status;
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-purple-100 text-purple-800",
    SHIPPED: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    REFUNDED: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    REFUNDED: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const m = today.getMonth() - dateOfBirth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) age--;
  return age;
}

export function maskCep(value: string): string {
  value = value.replace(/\D/g, "");
  if (value.length > 5) value = value.slice(0, 5) + "-" + value.slice(5, 8);
  return value;
}

export function maskPhone(value: string): string {
  value = value.replace(/\D/g, "");
  if (value.length === 11) {
    return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
  }
  if (value.length === 10) {
    return `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
  }
  return value;
}

export function maskCpf(value: string): string {
  value = value.replace(/\D/g, "");
  if (value.length > 9)
    value = value.slice(0, 3) + "." + value.slice(3, 6) + "." + value.slice(6, 9) + "-" + value.slice(9, 11);
  else if (value.length > 6)
    value = value.slice(0, 3) + "." + value.slice(3, 6) + "." + value.slice(6);
  else if (value.length > 3)
    value = value.slice(0, 3) + "." + value.slice(3);
  return value;
}

export function formatLoginDate(date: Date | null): string {
  if (!date) return "Nunca";
  return formatDateTime(date);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
