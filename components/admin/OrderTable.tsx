"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  formatDate,
  getOrderStatusLabel,
  getOrderStatusColor,
  getPaymentStatusLabel,
  getPaymentStatusColor,
} from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  paymentStatus: string | null;
  nfeStatus: string | null;
  createdAt: Date | string;
}

interface OrderTableProps {
  orders: Order[];
  onViewOrder: (orderId: string) => void;
}

export function OrderTable({ orders, onViewOrder }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-amber-100/40 text-base font-light">
          Nenhum pedido encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-amber-500/20">
            <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
              Nº Pedido
            </th>
            <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
              Cliente
            </th>
            <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
              Total
            </th>
            <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
              Status
            </th>
            <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
              Pagamento
            </th>
            <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
              NFe
            </th>
            <th className="text-left py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
              Data
            </th>
            <th className="text-right py-3 px-4 text-amber-100/50 text-xs font-medium uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-amber-500/10 hover:bg-amber-500/5 transition-colors"
            >
              <td className="py-3 px-4">
                <span className="font-mono text-amber-300 text-xs">
                  {order.orderNumber}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-col">
                  <span className="text-amber-100 font-medium">
                    {order.customerName}
                  </span>
                  <span className="text-amber-100/40 text-[11px]">
                    {order.customerEmail}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 text-amber-100 font-semibold">
                {formatCurrency(order.total)}
              </td>
              <td className="py-3 px-4">
                <Badge
                  className={`${getOrderStatusColor(order.status)} border-0 text-[10px] font-medium`}
                >
                  {getOrderStatusLabel(order.status)}
                </Badge>
              </td>
              <td className="py-3 px-4">
                {order.paymentStatus ? (
                  <Badge
                    className={`${getPaymentStatusColor(order.paymentStatus)} border-0 text-[10px] font-medium`}
                  >
                    {getPaymentStatusLabel(order.paymentStatus)}
                  </Badge>
                ) : (
                  <span className="text-amber-100/20 text-[11px]">—</span>
                )}
              </td>
              <td className="py-3 px-4">
                {order.nfeStatus ? (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px] font-medium">
                    {order.nfeStatus}
                  </Badge>
                ) : (
                  <span className="text-amber-100/20 text-[11px]">—</span>
                )}
              </td>
              <td className="py-3 px-4 text-amber-100/60 text-xs">
                {formatDate(order.createdAt)}
              </td>
              <td className="py-3 px-4 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewOrder(order.id)}
                  className="h-8 w-8 text-amber-100/50 hover:text-amber-300"
                  aria-label={`Ver pedido ${order.orderNumber}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
