import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Either uncomment the type definition or remove it completely if not needed
type FormData = {
  state: string;
  email: string;
  name: string;
  selectedCourse: string;
  phone: string;
  streetAddress: string;
  city: string;
  postcode: string;
  country: string;
  otherCountry?: string;
  education: string;
  fieldOfStudy: string;
  institution: string;
  hasITExperience: string;
  yearsOfExperience?: string;
  currentJob?: string;
  intake: string;
  referrer: string;
  submittedAt: string;
  acceptFalseInfo: boolean;
  acceptTerms: boolean;
}

export async function POST(request: Request) {
  try {
    const formData: FormData = await request.json()
    console.log('Received form data:', formData)
    
    // Log the environment variables (safely)
    console.log('Environment check:', {
      host: process.env.SMTP_HOST ? 'Set' : 'Not set',
      port: process.env.SMTP_PORT ? 'Set' : 'Not set',
      user: process.env.SMTP_USER ? 'Set' : 'Not set',
      from: process.env.SMTP_FROM ? 'Set' : 'Not set'
    })

    // Add error handling for missing env vars
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('Missing required email configuration')
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Test the connection
    try {
      await transporter.verify()
      console.log('SMTP connection verified successfully')
    } catch (smtpError) {
      console.error('SMTP verification failed:', smtpError)
      throw new Error('Failed to connect to email server')
    }

    // Update these mappings to match the onboarding-wizard.tsx values
    const educationLevels = {
      'high-school': 'High School',
      'associate': 'Associate Degree (Diploma)',
      'bachelor': 'Bachelor Degree',
      'master': 'Master Degree'
    };

    const courseNames = {
      'helpdesk-l1': 'IT Helpdesk Support (L1) - 6 weeks',
      'support-l2': 'IT Support and Networking (L2) - 10 weeks',
      'cyber-security': 'Cyber Security - 10 weeks'
    };

    const countries = {
      'au': 'Australia',
      'np': 'Nepal',
      'in': 'India',
      'us': 'United States',
      'uk': 'United Kingdom',
      'ca': 'Canada'
    };

    const states = {
      'nsw': 'New South Wales',
      'vic': 'Victoria',
      'qld': 'Queensland',
      'wa': 'Western Australia',
      'sa': 'South Australia',
      'tas': 'Tasmania',
      'act': 'Australian Capital Territory',
      'nt': 'Northern Territory'
    };

    // Update the states access to include type checking
    const stateValue = formData.state?.toLowerCase() as keyof typeof states;

    // Add type assertion for country lookup
    const countryValue = formData.country?.toLowerCase() as keyof typeof countries;

    // Update the education access to include type checking
    const educationValue = formData.education?.toLowerCase() as keyof typeof educationLevels;

    // Add type assertion for course lookup
    const courseValue = formData.selectedCourse?.toLowerCase() as keyof typeof courseNames;

    // Send email to applicant
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: formData.email,
      subject: 'Application Received - Heubert\'s Job Ready Program',
      html: `
        <h1>Thank you for your application!</h1>
        <p>Dear ${formData.name},</p>
        <p>We have received your application for the ${courseNames[courseValue] || formData.selectedCourse} course.</p>
        <p>Our team will review your application and contact you shortly.</p>
        <p>If you require any assistance in the meantime, please contact us at info@heubert.com or call us on 02 8315 7777.</p>
        <br/>
        <p>Best regards,</p>
        <p>Heubert Team</p>
      `,
    })

    // Send email to admin
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Course Application Received - ' + formData.name,
      html: `
        <h1>New Application Received</h1>
        
        <h2>Personal Details</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.email}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.phone}</td>
          </tr>
        </table>

        <h2>Address</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Street Address:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.streetAddress}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>City:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.city}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>State:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${states[stateValue] || formData.state}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Postcode:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.postcode}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Country:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${countries[countryValue] || formData.country}</td>
          </tr>
        </table>

        <h2>Education & Experience</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Education Level:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${educationLevels[educationValue] || formData.education}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Field of Study:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.fieldOfStudy}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Institution:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.institution}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>IT Experience:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.hasITExperience === 'yes' ? 'Yes' : 'No'}</td>
          </tr>
        </table>

        <h2>Course Details</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Selected Course:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${courseNames[courseValue] || formData.selectedCourse}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Intake Date:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date(formData.intake).toLocaleDateString()}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Referrer:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.referrer}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Application Date:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date(formData.submittedAt).toLocaleString()}</td>
          </tr>
        </table>

        <h2>Agreements</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Accepted False Info Terms:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.acceptFalseInfo ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Accepted T&Cs:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.acceptTerms ? 'Yes' : 'No'}</td>
          </tr>
        </table>
      `,
    })

    console.log('Emails sent successfully')
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    )
  }
}

