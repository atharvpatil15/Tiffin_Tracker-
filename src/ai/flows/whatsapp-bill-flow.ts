'use server';
/**
 * @fileOverview A flow for sending a tiffin bill via WhatsApp.
 *
 * - sendWhatsappBill: A function that generates a WhatsApp message with a bill summary and a PDF attachment.
 * - WhatsappBillInput: The input type for the sendWhatsappBill function.
 * - WhatsappBillOutput: The return type for the sendWhatsappBill function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';
import axios from 'axios';
import FormData from 'form-data';

const WhatsappBillInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  phoneNumber: z
    .string()
    .describe('The WhatsApp-enabled phone number of the customer.'),
  totalAmount: z.number().describe('The total bill amount.'),
  billingCycle: z.string().describe('The billing cycle, e.g., "Jan 1 - Jan 31".'),
  pdfDataUri: z.string().describe("The bill PDF, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."),
});
export type WhatsappBillInput = z.infer<typeof WhatsappBillInputSchema>;

const WhatsappBillOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type WhatsappBillOutput = z.infer<typeof WhatsappBillOutputSchema>;

export async function sendWhatsappBill(
  input: WhatsappBillInput
): Promise<WhatsappBillOutput> {
  return whatsappBillFlow(input);
}

// Tool to send a WhatsApp message with a PDF bill.
const sendWhatsAppTool = ai.defineTool(
  {
    name: 'sendWhatsAppBill',
    description: 'Sends a pre-formatted message with a PDF bill to a WhatsApp number.',
    inputSchema: z.object({
      to: z.string().describe("The recipient's WhatsApp-enabled phone number."),
      customerName: z.string().describe('The name of the customer.'),
      billingCycle: z.string().describe('The billing period for the invoice.'),
      totalAmount: z.string().describe('The total amount due for the bill.'),
      pdfDataUri: z.string().describe('The Data URI of the PDF bill to be sent.'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      messageId: z.string().optional(),
      error: z.string().optional(),
    }),
  },
  async (input) => {
    const { to, customerName, billingCycle, totalAmount, pdfDataUri } = input;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const fromPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !fromPhoneNumberId) {
      const errorMsg = 'WhatsApp environment variables (WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID) not set.';
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      // 1. Upload the PDF media to WhatsApp
      const pdfBuffer = Buffer.from(pdfDataUri.split('base64,')[1], 'base64');
      const formData = new FormData();
      formData.append('messaging_product', 'whatsapp');
      formData.append('file', pdfBuffer, {
        filename: 'bill.pdf',
        contentType: 'application/pdf',
      });

      const uploadResponse = await axios.post(
        `https://graph.facebook.com/v20.0/${fromPhoneNumberId}/media`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const mediaId = uploadResponse.data.id;
      if (!mediaId) {
        throw new Error('Failed to get media ID from WhatsApp.');
      }

      // 2. Send the message template with the uploaded media
      const messageResponse = await axios.post(
        `https://graph.facebook.com/v20.0/${fromPhoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'template',
          template: {
            name: 'invoice_notification', // You must create a template with this name
            language: { code: 'en_US' },
            components: [
              {
                type: 'header',
                parameters: [
                  {
                    type: 'document',
                    document: {
                      id: mediaId,
                      filename: `TiffinBill-${customerName}.pdf`,
                    },
                  },
                ],
              },
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: customerName },
                  { type: 'text', text: billingCycle },
                  { type: 'text', text: totalAmount },
                ],
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const messageId = messageResponse.data?.messages?.[0]?.id;
      if (!messageId) {
        throw new Error('Message sending did not return a message ID.');
      }
      return { success: true, messageId: messageId };

    } catch (error: any) {
      const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      console.error('Error sending WhatsApp message:', errorDetails);
      return { success: false, error: errorDetails };
    }
  }
);


const whatsappBillFlow = ai.defineFlow(
  {
    name: 'whatsappBillFlow',
    inputSchema: WhatsappBillInputSchema,
    outputSchema: WhatsappBillOutputSchema,
  },
  async (input) => {
    // Directly call the tool without the AI wrapper.
    const toolResponse = await sendWhatsAppTool({
      to: input.phoneNumber,
      customerName: input.customerName,
      billingCycle: input.billingCycle,
      totalAmount: `Rs. ${input.totalAmount.toFixed(2)}`,
      pdfDataUri: input.pdfDataUri,
    });
    
    const wasSuccessful = toolResponse.success;

    return {
      success: wasSuccessful,
      message: wasSuccessful
        ? `WhatsApp message sent successfully. Message ID: ${toolResponse.messageId}`
        : `Failed to send WhatsApp message. Details: ${toolResponse.error}`,
    };
  }
);
