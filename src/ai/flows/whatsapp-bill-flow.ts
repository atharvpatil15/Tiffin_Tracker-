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

// Dummy tool to simulate sending a WhatsApp message.
// In a real application, this would integrate with a service like Twilio.
const sendWhatsAppTool = ai.defineTool(
  {
    name: 'sendWhatsAppMessage',
    description: 'Sends a message with a media attachment to a WhatsApp number.',
    inputSchema: z.object({
      to: z.string().describe('The recipient\'s phone number.'),
      message: z.string().describe('The text message to send.'),
      media: z.string().describe('The data URI of the media to attach.'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      messageId: z.string().optional(),
    }),
  },
  async (input) => {
    console.log(`Simulating sending WhatsApp to ${input.to}`);
    console.log(`Message: ${input.message}`);
    // In a real implementation, you'd use a service like Twilio here.
    // For now, we'll just simulate a successful send.
    return { success: true, messageId: `fake-msg-${Date.now()}` };
  }
);


const whatsappBillFlow = ai.defineFlow(
  {
    name: 'whatsappBillFlow',
    inputSchema: WhatsappBillInputSchema,
    outputSchema: WhatsappBillOutputSchema,
  },
  async (input) => {

    const prompt = `You are a helpful billing assistant for TiffinTrack. Your task is to send a monthly tiffin bill to a customer via WhatsApp.

Customer Name: ${input.customerName}
Billing Cycle: ${input.billingCycle}
Total Amount: Rs. ${input.totalAmount.toFixed(2)}

Generate a friendly and professional WhatsApp message. Start with a greeting, clearly state the total amount and billing period, and mention that the detailed PDF bill is attached.
Then, use the provided tool to send the message and the PDF attachment to the customer's phone number.`;

    const llmResponse = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview'),
      prompt: prompt,
      tools: [sendWhatsAppTool],
      toolChoice: 'required',
    });

    const toolRequest = llmResponse.toolRequest();
    if (!toolRequest) {
      return {
        success: false,
        message: 'Failed to generate tool request to send WhatsApp message.',
      };
    }
    
    // In a real scenario, you might want to do more with the tool's output.
    // For this simulation, we'll just confirm it was called.
    const toolResponse = await toolRequest.run();

    const wasSuccessful = toolResponse.output?.success ?? false;

    return {
      success: wasSuccessful,
      message: wasSuccessful
        ? 'WhatsApp message sent successfully.'
        : 'Failed to send WhatsApp message.',
    };
  }
);
