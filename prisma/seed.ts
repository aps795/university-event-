import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding DHSGSU EventHub database with official realistic university data...");

  // Clear existing records
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  const hashedAdminPassword = await bcrypt.hash("Admin@123", 10);
  const hashedOrganizerPassword = await bcrypt.hash("Organizer@123", 10);
  const hashedStudentPassword = await bcrypt.hash("Student@123", 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      name: "Prof. Arvind Sharma (Dean Student Welfare)",
      email: "admin@dhsgsu.edu.in",
      passwordHash: hashedAdminPassword,
      role: "ADMIN",
      department: "Office of the Dean, Student Welfare",
      phone: "+91 7582 264510",
    },
  });

  const organizerCS = await prisma.user.create({
    data: {
      name: "Dr. Rajesh K. Sahu (Faculty Convener)",
      email: "organizer@dhsgsu.edu.in",
      passwordHash: hashedOrganizerPassword,
      role: "ORGANIZER",
      department: "Department of Computer Science & Applications",
      phone: "+91 94251 12345",
    },
  });

  const organizerCultural = await prisma.user.create({
    data: {
      name: "Dr. Meenakshi Dubey (Cultural Council)",
      email: "cultural.coord@dhsgsu.edu.in",
      passwordHash: hashedOrganizerPassword,
      role: "ORGANIZER",
      department: "Department of Performing Arts & Music",
      phone: "+91 94252 67890",
    },
  });

  const student1 = await prisma.user.create({
    data: {
      name: "Aditya Verma",
      email: "student@dhsgsu.edu.in",
      passwordHash: hashedStudentPassword,
      role: "STUDENT",
      enrollmentNumber: "U22CS045",
      course: "B.Tech Computer Science & Engineering",
      department: "Department of Computer Science & Applications",
      semester: "6th Semester",
      phone: "+91 98765 43210",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Pooja Bundela",
      email: "pooja.bundela@dhsgsu.edu.in",
      passwordHash: hashedStudentPassword,
      role: "STUDENT",
      enrollmentNumber: "U23PH012",
      course: "B.Pharm",
      department: "Department of Pharmaceutical Sciences",
      semester: "4th Semester",
      phone: "+91 98765 11223",
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: "Vikram Rajput",
      email: "vikram.rajput@dhsgsu.edu.in",
      passwordHash: hashedStudentPassword,
      role: "STUDENT",
      enrollmentNumber: "U21LW088",
      course: "B.A. LL.B. (Hons)",
      department: "Department of Law",
      semester: "8th Semester",
      phone: "+91 98765 44556",
    },
  });

  // 2. Create Departments across DHSGSU Schools
  const deptCS = await prisma.department.create({
    data: {
      name: "Department of Computer Science & Applications",
      school: "School of Applied Sciences",
      description: "Offering B.Tech, MCA, M.Sc. and Ph.D. programs with focus on AI, Systems, and Software Engineering.",
    },
  });

  const deptPharma = await prisma.department.create({
    data: {
      name: "Department of Pharmaceutical Sciences",
      school: "School of Pharmaceutical Sciences",
      description: "Pioneering premier pharmacy education, drug formulation, and pharmacological research in central India.",
    },
  });

  const deptGeology = await prisma.department.create({
    data: {
      name: "Department of Applied Geology",
      school: "School of Applied Sciences",
      description: "Center of Advanced Study (CAS) recognized for mineralogy, hydrogeology, and petrology research.",
    },
  });

  const deptLaw = await prisma.department.create({
    data: {
      name: "Department of Law",
      school: "School of Law",
      description: "One of the earliest and most esteemed law faculties in Madhya Pradesh providing constitutional and cyber law training.",
    },
  });

  const deptMusic = await prisma.department.create({
    data: {
      name: "Department of Performing Arts & Music",
      school: "School of Arts and Humanities",
      description: "Promoting Indian Classical Music, Kathak, Folk Traditions, and cultural heritage.",
    },
  });

  const deptFineArts = await prisma.department.create({
    data: {
      name: "Department of Fine Arts",
      school: "School of Arts and Humanities",
      description: "Excellence in Painting, Applied Arts, Sculpture, Printmaking, and Art History.",
    },
  });

  const deptSports = await prisma.department.create({
    data: {
      name: "Department of Physical Education & Sports",
      school: "School of Educational Studies",
      description: "Fostering athletic excellence, national sports representation, and university fitness development.",
    },
  });

  const deptManagement = await prisma.department.create({
    data: {
      name: "Department of Business Management",
      school: "School of Commerce and Management",
      description: "MBA and doctoral research in marketing, finance, human resources, and business analytics.",
    },
  });

  // 3. Create Events
  // Event 1: AI & ML Workshop
  const event1 = await prisma.event.create({
    data: {
      title: "AI & Machine Learning National Workshop 2026",
      description: "A comprehensive 3-day hands-on workshop on Deep Learning, Large Language Models, and Applied Artificial Intelligence. Students will build and evaluate neural network models using PyTorch and explore AI applications in scientific research.",
      category: "Academic",
      subCategory: "Academic Workshops",
      departmentId: deptCS.id,
      organizerId: organizerCS.id,
      venue: "Computer Science Seminar Hall & Lab 3, Patharia Hills",
      eventDate: "2026-10-15",
      startTime: "10:00 AM",
      endTime: "01:00 PM",
      registrationDeadline: "2026-10-12",
      maxParticipants: 120,
      eligibility: "Open to all DHSGSU students (UG/PG/Ph.D.) with basic programming knowledge.",
      rules: JSON.stringify([
        "Participants must bring their university identity cards.",
        "Attendance in all sessions is mandatory for receiving the digital certificate.",
        "Laptops are recommended for the hands-on lab sessions.",
        "Certificate will be generated post verification of attendance.",
      ]),
      speakerGuest: "Prof. R.K. Trivedi (Visiting Scientist, IIT Indore)",
      contactPerson: "Dr. Rajesh K. Sahu",
      contactPhone: "+91 94251 12345",
      requiredDocuments: "University Identity Card / Samarth Enrollment Slip",
      posterUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      isFeatured: true,
      isPast: false,
    },
  });

  // Event 2: HackDHSGSU 2026
  const event2 = await prisma.event.create({
    data: {
      title: "HackDHSGSU 2026: Central India 24-Hour Hackathon",
      description: "Join Dr. Harisingh Gour Vishwavidyalaya's flagship annual hackathon. Solve real-world challenges across Smart Campus, Healthcare, Rural Tech, and AI for Social Good. Prizes worth ₹1,00,000 and direct mentorship from industry leaders.",
      category: "Technical",
      subCategory: "Hackathons",
      departmentId: deptCS.id,
      organizerId: organizerCS.id,
      venue: "University Central Computing Centre, Near Administrative Block",
      eventDate: "2026-10-24",
      startTime: "09:00 AM",
      endTime: "05:00 PM",
      registrationDeadline: "2026-10-20",
      maxParticipants: 150,
      eligibility: "Teams of 2 to 4 students from any faculty or affiliated institutions.",
      rules: JSON.stringify([
        "All code must be written during the 24-hour hackathon period.",
        "Open source libraries and public APIs are permissible.",
        "Originality and impact on society will be key judging criteria.",
        "Mentors will conduct milestone check-ins every 6 hours.",
      ]),
      speakerGuest: "Dr. Sandeep Deshmukh (Head of Engineering, Sagar Tech Innovation Hub)",
      contactPerson: "Mr. Gaurav Shukla",
      contactPhone: "+91 98930 45678",
      requiredDocuments: "Valid Student ID and Hackathon Team Registration Slip",
      posterUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      isFeatured: true,
      isPast: false,
    },
  });

  // Event 3: Gour Gourav Utsav 2024 (HISTORICAL / PAST EVENT)
  const event3 = await prisma.event.create({
    data: {
      title: "Gour Gourav Utsav 2024 (38th AIU Inter-University Central Zone Youth Festival)",
      description: "DHSGSU proudly hosted the 38th AIU Inter-University Central Zone Youth Festival 'Gour Gourav Utsav' bringing together thousands of participants from over 30 universities across Central India in Music, Dance, Theatre, Literary, and Fine Arts.",
      category: "Cultural",
      subCategory: "Cultural Festivals",
      departmentId: deptMusic.id,
      organizerId: organizerCultural.id,
      venue: "Swarna Jayanti Sabhagar (Golden Jubilee Auditorium) & Tagore Hall",
      eventDate: "2024-11-26",
      startTime: "09:00 AM",
      endTime: "08:00 PM",
      registrationDeadline: "2024-11-15",
      maxParticipants: 500,
      eligibility: "Selected university delegates and registered student participants.",
      rules: JSON.stringify([
        "Conducted in accordance with AIU Youth Festival Rules & Regulations.",
        "Disciplines: Classical Vocal, Classical Dance, Skit, Elocution, On-the-spot Painting, Clay Modeling.",
        "Strict adherence to performance timing caps.",
      ]),
      speakerGuest: "Hon'ble Vice Chancellor & AIU Cultural Observers",
      contactPerson: "Dr. Meenakshi Dubey",
      contactPhone: "+91 94252 67890",
      requiredDocuments: "AIU Eligibility Certificate & University ID",
      posterUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
      status: "COMPLETED",
      isFeatured: false,
      isPast: true, // Past event explicitly marked as requested
    },
  });

  // Event 4: Gour Gourav Utsav 2026 (Upcoming Cultural Fest)
  const event4 = await prisma.event.create({
    data: {
      title: "Gour Gourav Utsav 2026: Annual University Cultural Fest",
      description: "The grand annual cultural extravaganza of Dr. Harisingh Gour Vishwavidyalaya celebrating youth talent in Music, Classical & Folk Dance, Theatre, Mime, Literary debates, and Fine Arts.",
      category: "Cultural",
      subCategory: "Dance",
      departmentId: deptMusic.id,
      organizerId: organizerCultural.id,
      venue: "Swarna Jayanti Sabhagar (Golden Jubilee Auditorium)",
      eventDate: "2026-11-26",
      startTime: "10:00 AM",
      endTime: "07:00 PM",
      registrationDeadline: "2026-11-20",
      maxParticipants: 350,
      eligibility: "Open to all bonafide students of DHSGSU across all schools.",
      rules: JSON.stringify([
        "Solo and group events have dedicated registration slots.",
        "Max time: Solo Dance (5 mins), Group Dance (8 mins), Classical Vocal (10 mins).",
        "Track recordings must be submitted to the audio desk 2 hours before performance.",
      ]),
      speakerGuest: "Eminent Classical Exponents & Folk Artists of Bundelkhand",
      contactPerson: "Cultural Council Office",
      contactPhone: "+91 94252 67890",
      requiredDocuments: "University Identity Card",
      posterUrl: "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      isFeatured: true,
      isPast: false,
    },
  });

  // Event 5: Inter-Department Cricket Championship 2026
  const event5 = await prisma.event.create({
    data: {
      title: "Annual Inter-Departmental T20 Cricket & Athletics Meet 2026",
      description: "The premier sporting tournament of the academic year featuring knockout matches between schools and track & field athletic competitions at the University Sports Complex.",
      category: "Sports",
      subCategory: "Cricket",
      departmentId: deptSports.id,
      organizerId: organizerCS.id,
      venue: "University Sports Ground & Stadium, Patharia Hills",
      eventDate: "2026-11-05",
      startTime: "08:30 AM",
      endTime: "05:30 PM",
      registrationDeadline: "2026-10-31",
      maxParticipants: 200,
      eligibility: "Official departmental teams endorsed by Head of the Department.",
      rules: JSON.stringify([
        "BCCI standard T20 playing conditions apply.",
        "All players must wear proper sports whites or departmental jerseys.",
        "Reporting time: 30 minutes before toss.",
      ]),
      speakerGuest: "Director of Physical Education & Sports",
      contactPerson: "Sports Board Coordinator",
      contactPhone: "+91 98260 77889",
      requiredDocuments: "Medical Fitness Certificate & University ID Card",
      posterUrl: "https://images.unsplash.com/photo-1531415074868-036b1c57e3ce?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      isFeatured: false,
      isPast: false,
    },
  });

  // Event 6: National Seminar on Pharmaceutical Advances
  const event6 = await prisma.event.create({
    data: {
      title: "National Seminar on Recent Advances in Novel Drug Delivery Systems",
      description: "Exploring nanoscale therapeutics, targeted drug delivery, phytopharmaceutical standardization, and clinical translation in modern pharmaceutical sciences.",
      category: "Academic",
      subCategory: "Seminars",
      departmentId: deptPharma.id,
      organizerId: organizerCS.id,
      venue: "Sir C.V. Raman Auditorium, Pharmacy Block",
      eventDate: "2026-11-12",
      startTime: "11:00 AM",
      endTime: "04:30 PM",
      registrationDeadline: "2026-11-08",
      maxParticipants: 100,
      eligibility: "B.Pharm, M.Pharm, Biotechnology and Chemistry research scholars.",
      rules: JSON.stringify([
        "Abstract submission for poster presentation closes 5 days before the seminar.",
        "Formal attire is mandatory.",
        "E-certificates will be issued to registered delegates who mark attendance.",
      ]),
      speakerGuest: "Dr. S. K. Jain (Renowned Pharmacologist, AIIMS Bhopal)",
      contactPerson: "Dr. Vandana Patel",
      contactPhone: "+91 94254 99001",
      requiredDocuments: "University Registration Card",
      posterUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      isFeatured: false,
      isPast: false,
    },
  });

  // Event 7: Cyber Law & Digital Ethics Symposium
  const event7 = await prisma.event.create({
    data: {
      title: "National Symposium on Cyber Law, AI Ethics and Digital Privacy",
      description: "Deliberation on India's Digital Personal Data Protection (DPDP) Act, cyber forensics, AI copyright dilemmas, and legal protections in the digital era.",
      category: "Academic",
      subCategory: "Conferences",
      departmentId: deptLaw.id,
      organizerId: organizerCS.id,
      venue: "Law Faculty Moot Court Hall, Patharia Hills Campus",
      eventDate: "2026-11-18",
      startTime: "10:30 AM",
      endTime: "03:30 PM",
      registrationDeadline: "2026-11-14",
      maxParticipants: 120,
      eligibility: "Students of Law, Computer Science, and Social Sciences.",
      rules: JSON.stringify([
        "Interactive Q&A session will follow each keynote lecture.",
        "Paper presentations should strictly adhere to bluebook citation guidelines.",
      ]),
      speakerGuest: "Hon'ble Justice (Retd.) M.P. High Court",
      contactPerson: "Dean, Faculty of Law",
      contactPhone: "+91 7582 264530",
      requiredDocuments: "College ID Card",
      posterUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      isFeatured: false,
      isPast: false,
    },
  });

  // Event 8: Founder's Day Oration (Gour Jayanti)
  const event8 = await prisma.event.create({
    data: {
      title: "Dr. Sir Hari Singh Gour Memorial Oration & Founder's Day 2026",
      description: "Commemorating the legacy and philanthropy of Sir Hari Singh Gour on 26th November. Featuring a prestigious keynote oration, university academic awards, and floral tributes.",
      category: "Student Activities",
      subCategory: "Awareness Programs",
      departmentId: deptManagement.id,
      organizerId: organizerCS.id,
      venue: "B.C. Patel Auditorium, Central Campus",
      eventDate: "2026-11-26",
      startTime: "09:30 AM",
      endTime: "01:30 PM",
      registrationDeadline: "2026-11-24",
      maxParticipants: 400,
      eligibility: "Open to all faculty, staff, alumni, and students of DHSGSU.",
      rules: JSON.stringify([
        "All attendees must be seated by 09:15 AM.",
        "Mobile phones must be switched to silent mode inside the auditorium.",
      ]),
      speakerGuest: "Distinguished Jurist & Vice-Chancellor",
      contactPerson: "Registrar Secretariat",
      contactPhone: "+91 7582 264444",
      requiredDocuments: "University Identity Card",
      posterUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      isFeatured: true,
      isPast: false,
    },
  });

  // Event 9: Fine Arts Exhibition
  const event9 = await prisma.event.create({
    data: {
      title: "Bundelkhand Heritage: Fine Arts & Clay Modeling Exhibition",
      description: "Showcasing traditional and contemporary artworks, sculptures, folk motifs, and clay figurines celebrating the cultural landscapes of Sagar and Bundelkhand.",
      category: "Cultural",
      subCategory: "Fine Arts",
      departmentId: deptFineArts.id,
      organizerId: organizerCultural.id,
      venue: "Department of Fine Arts Gallery, Arts Block",
      eventDate: "2026-12-02",
      startTime: "11:00 AM",
      endTime: "05:00 PM",
      registrationDeadline: "2026-11-28",
      maxParticipants: 80,
      eligibility: "Open to all students with artistic interest.",
      rules: JSON.stringify([
        "Exhibition materials and easels will be arranged by the department.",
        "All displayed works are evaluated by an expert jury panel.",
      ]),
      speakerGuest: "Eminent Sculptor & Lalit Kala Akademi Fellow",
      contactPerson: "Fine Arts Studio Coordinator",
      contactPhone: "+91 94255 11223",
      requiredDocuments: "University Identity Card",
      posterUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      isFeatured: false,
      isPast: false,
    },
  });

  // Event 10: Geological Field Workshop
  const event10 = await prisma.event.create({
    data: {
      title: "Field Geology & Groundwater Conservation Workshop",
      description: "Hands-on geophysical exploration, rock identification in Deccan Traps, and community rainwater harvesting awareness program.",
      category: "Academic",
      subCategory: "Academic Workshops",
      departmentId: deptGeology.id,
      organizerId: organizerCS.id,
      venue: "Applied Geology Museum & Field Station",
      eventDate: "2026-12-10",
      startTime: "09:30 AM",
      endTime: "04:00 PM",
      registrationDeadline: "2026-12-05",
      maxParticipants: 60,
      eligibility: "Science & Engineering students.",
      rules: JSON.stringify([
        "Field boots and sun protection recommended for outdoor site visits.",
        "Geological survey kits will be provided.",
      ]),
      speakerGuest: "Dr. P. C. Sen (Geological Survey of India)",
      contactPerson: "Dr. Anirudh Mishra",
      contactPhone: "+91 94251 77665",
      requiredDocuments: "College ID Card",
      posterUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      isFeatured: false,
      isPast: false,
    },
  });

  // 4. Create Registrations
  // Student 1 registered for Event 1 (AI & ML Workshop)
  const reg1 = await prisma.registration.create({
    data: {
      eventId: event1.id,
      studentId: student1.id,
      registrationId: "DHSGSU-EVT-2026-0001",
      qrCode: "DHSGSU-REG:DHSGSU-EVT-2026-0001:U22CS045",
      status: "CONFIRMED",
      notes: "Interested in PyTorch and NLP applications",
    },
  });

  // Student 1 registered for Event 2 (HackDHSGSU)
  const reg2 = await prisma.registration.create({
    data: {
      eventId: event2.id,
      studentId: student1.id,
      registrationId: "DHSGSU-EVT-2026-0002",
      qrCode: "DHSGSU-REG:DHSGSU-EVT-2026-0002:U22CS045",
      status: "CONFIRMED",
      notes: "Team Lead - CodeGour Pioneers",
    },
  });

  // Student 1 registered for Event 3 (Gour Gourav Utsav 2024 - COMPLETED & ATTENDED)
  const reg3 = await prisma.registration.create({
    data: {
      eventId: event3.id,
      studentId: student1.id,
      registrationId: "DHSGSU-EVT-2024-0342",
      qrCode: "DHSGSU-REG:DHSGSU-EVT-2024-0342:U22CS045",
      status: "CONFIRMED",
      registeredAt: new Date("2024-11-10T10:00:00Z"),
    },
  });

  // Student 2 registered for Event 6 (Pharma seminar)
  await prisma.registration.create({
    data: {
      eventId: event6.id,
      studentId: student2.id,
      registrationId: "DHSGSU-EVT-2026-0003",
      qrCode: "DHSGSU-REG:DHSGSU-EVT-2026-0003:U23PH012",
      status: "CONFIRMED",
    },
  });

  // Student 3 registered for Event 7 (Cyber Law)
  await prisma.registration.create({
    data: {
      eventId: event7.id,
      studentId: student3.id,
      registrationId: "DHSGSU-EVT-2026-0004",
      qrCode: "DHSGSU-REG:DHSGSU-EVT-2026-0004:U21LW088",
      status: "CONFIRMED",
    },
  });

  // 5. Create Attendance for Completed Event
  const att1 = await prisma.attendance.create({
    data: {
      eventId: event3.id,
      studentId: student1.id,
      registrationId: reg3.registrationId,
      checkInTime: new Date("2024-11-26T09:15:00Z"),
      status: "PRESENT",
      markedBy: organizerCultural.id,
    },
  });

  // 6. Create Digital Certificate for attended past event
  await prisma.certificate.create({
    data: {
      eventId: event3.id,
      studentId: student1.id,
      certificateId: "DHSGSU-CERT-2024-0342",
      certificateUrl: "/certificates/DHSGSU-CERT-2024-0342",
      issuedAt: new Date("2024-12-01T12:00:00Z"),
    },
  });

  // 7. Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: student1.id,
        title: "Registration Confirmed!",
        message: "Your registration for 'AI & Machine Learning National Workshop 2026' has been confirmed. Registration ID: DHSGSU-EVT-2026-0001",
        type: "SUCCESS",
        link: "/my-events",
      },
      {
        userId: student1.id,
        title: "Certificate Available",
        message: "Your digital participation certificate for 'Gour Gourav Utsav 2024' is ready for download.",
        type: "INFO",
        link: "/my-events",
      },
      {
        userId: student1.id,
        title: "Event Reminder",
        message: "HackDHSGSU 2026 registration deadline is approaching on 20 October 2026.",
        type: "WARNING",
        link: `/events/${event2.id}`,
      },
      {
        userId: organizerCS.id,
        title: "New Registration",
        message: "Aditya Verma (U22CS045) registered for AI & Machine Learning Workshop.",
        type: "INFO",
        link: "/organizer",
      },
    ],
  });

  // 8. Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: "APPROVE_EVENT",
        entity: "Event",
        entityId: event1.id,
        details: "Approved 'AI & Machine Learning National Workshop 2026' for publication.",
      },
      {
        userId: organizerCS.id,
        action: "CREATE_EVENT",
        entity: "Event",
        entityId: event2.id,
        details: "Created 'HackDHSGSU 2026' draft.",
      },
      {
        userId: student1.id,
        action: "REGISTER_EVENT",
        entity: "Registration",
        entityId: reg1.id,
        details: "Registered for AI & Machine Learning National Workshop with ID DHSGSU-EVT-2026-0001",
      },
      {
        userId: organizerCultural.id,
        action: "MARK_ATTENDANCE",
        entity: "Attendance",
        entityId: att1.id,
        details: "Marked attendance for Aditya Verma (U22CS045) via QR scan.",
      },
    ],
  });

  console.log("Database seeded successfully with authentic DHSGSU details!");
  console.log("Demo Accounts created:");
  console.log("- Student: student@dhsgsu.edu.in / Student@123");
  console.log("- Organizer: organizer@dhsgsu.edu.in / Organizer@123");
  console.log("- Admin: admin@dhsgsu.edu.in / Admin@123");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
