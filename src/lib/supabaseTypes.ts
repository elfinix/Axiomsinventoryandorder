// Database types matching Supabase schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          item_code: string;
          item_name: string;
          price: number;
          stock: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          item_code: string;
          item_name: string;
          price: number;
          stock?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          item_code?: string;
          item_name?: string;
          price?: number;
          stock?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      customers: {
        Row: {
          id: string;
          full_name: string;
          address: string;
          contact_number: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          full_name: string;
          address: string;
          contact_number: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string;
          address?: string;
          contact_number?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          order_type: 'cash' | 'installment';
          order_date: string;
          status: 'active' | 'completed' | 'cancelled';
          total_cost: number;
          interest_rate: number | null;
          downpayment: number | null;
          daily_payment: number | null;
          total_collected: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          customer_id: string;
          order_type: 'cash' | 'installment';
          order_date?: string;
          status?: 'active' | 'completed' | 'cancelled';
          total_cost: number;
          interest_rate?: number | null;
          downpayment?: number | null;
          daily_payment?: number | null;
          total_collected?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          customer_id?: string;
          order_type?: 'cash' | 'installment';
          order_date?: string;
          status?: 'active' | 'completed' | 'cancelled';
          total_cost?: number;
          interest_rate?: number | null;
          downpayment?: number | null;
          daily_payment?: number | null;
          total_collected?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          day: number;
          amount: number;
          paid: boolean;
          date_paid: string | null;
          payment_method: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          day: number;
          amount: number;
          paid?: boolean;
          date_paid?: string | null;
          payment_method?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          day?: number;
          amount?: number;
          paid?: boolean;
          date_paid?: string | null;
          payment_method?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
