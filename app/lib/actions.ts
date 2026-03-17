'use server';
import { z } from 'zod';
import postgres from 'postgres';
import {revalidatePath } from 'next/cache';
import {redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { cookies } from 'next/headers';
import { redis } from '@/app/lib/redis';

const sql = postgres(process.env.POSTGRES_URL!, {ssl : 'require'});

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error : 'Please select a customer.'
  }),
  amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.'}),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.'
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({id: true, date: true});
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
    const rawFormData ={
        customerId : formData.get('customerId'),
        amount : formData.get('amount'),
        status : formData.get('status'),
    };
    const validatedFields = CreateInvoice.safeParse(rawFormData)
      // If form validation fails, return errors early. Otherwise, continue.
      if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
          message: 'Missing Fields. Failed to Create Invoice.',
        };
      }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

    try{

        await sql`
            insert into invoices(customer_id, amount, status, date)
            values (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
    } catch (error) {
        console.error(error);
        return {
            message : 'Database Error: Failed to Create Invoice'
        };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
    const rawFormData ={
        customerId : formData.get('customerId'),
        amount : formData.get('amount'),
        status : formData.get('status'),
    };
  const validatedFields = UpdateInvoice.safeParse(rawFormData);
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;


    try{
      await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
    } catch (error) {
        console.error(error);
        return {
            message : 'Database Error: Failed to Update Invoice'
        };
    }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    throw new Error('Failed to Delete Invoice');

  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function logout() {
  const sessionCookieName =
    process.env.NODE_ENV === 'production' ? '__Secure-session-id' : 'session-id';
    console.log(`logout: ${sessionCookieName}`)

  const cookieStore = await cookies();
  const sessionId = cookieStore.get(sessionCookieName)?.value;

  if (sessionId) {
    const stored = await redis.get(`session:${sessionId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { id?: string };
        if (parsed?.id) {
          await redis.srem(`user_sessions:${parsed.id}`, sessionId);
        }
      } catch {
        // ignore parse issues; still revoke the session key below
      }
    }
    await redis.del(`session:${sessionId}`);
  }

  cookieStore.set(sessionCookieName, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });

  redirect('/login');
}