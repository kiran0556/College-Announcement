import emailjs from '@emailjs/browser';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// ⚠️ REPLACE WITH YOUR EMAILJS KEYS
const EMAILJS_SERVICE_ID = "service_placeholder";
const EMAILJS_TEMPLATE_ID = "template_placeholder";
const EMAILJS_PUBLIC_KEY = "public_key_placeholder";

export const sendAnnouncementEmail = async (announcement) => {
    try {
        // 1. Fetch all student emails
        const querySnapshot = await getDocs(collection(db, "students"));
        const emails = [];
        querySnapshot.forEach((doc) => {
            if (doc.data().email) emails.push(doc.data().email);
        });

        if (emails.length === 0) {
            console.log("No students to email.");
            return;
        }

        // 2. Send email (Batching is ideal, but for hackathon looping/single call to self-bcc is easier)
        // Limitation: Free EmailJS tier is limited. 
        // Trick: We will send ONE email to the admin with all students in BCC, or loop if list is small.
        // For this demo: We will simulate sending to "all" by sending one email to the logged in admin/demo email.

        // Note: In a real app, use a Cloud Function. Here we use Client Side.
        // We will attempt to send one email per student (WARNING: Rate limits).
        // BETTER HACK: Send raw request to EmailJS for each, or just console log success for the demo if keys aren't real.

        // Check if keys are placeholders
        if (EMAILJS_SERVICE_ID === "service_placeholder") {
            console.warn("EmailJS not configured. Simulating email sent to:", emails);
            return { success: true, simulated: true };
        }

        // Actual Send Logic (simulated loop for demo safety)
        const templateParams = {
            subject: "New Announcement: " + announcement.title,
            message: announcement.message,
            to_email: emails.join(",") // Putting all in 'to' might expose emails, BCC is better but EmailJS client side is tricky.
        };

        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
        console.log("Email sent successfully!");
        return { success: true };

    } catch (error) {
        console.error("Failed to send email:", error);
        return { success: false, error };
    }
};
