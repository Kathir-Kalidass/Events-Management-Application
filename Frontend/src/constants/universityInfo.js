// University and Department Information Constants
export const UNIVERSITY_INFO = {
  name: "Anna University",
  establishedDate: "4th September, 1978",
  namedAfter: "Late Dr. C.N. Annadurai, former Chief Minister of Tamil Nadu",
  description: `Anna University was established on 4th September, 1978 as a unitary type of University. This University was named after Late Dr.C.N.Annadurai, former Chief Minister of Tamil Nadu. It offers higher education in Engineering, Technology, Architecture and Applied Sciences relevant to the current and projected needs of the society. Besides promoting research and disseminating knowledge gained therefrom, it fosters cooperation between the academic and industrial communities.`,
  
  constituent_institutions: [
    {
      name: "College of Engineering (CEG)",
      established: "1794"
    },
    {
      name: "Alagappa College of Technology (ACT)",
      established: "1944"
    },
    {
      name: "Madras Institute of Technology (MIT)",
      established: "1949"
    },
    {
      name: "School of Architecture & Planning (SAP)",
      established: "1957"
    }
  ],
  
  city: "Chennai (formerly Madras)",
  
  full_about: `The University was formed by bringing together and integrating four well known technical institutions in the city of Madras (now Chennai) namely,
College of Engineering (CEG) (Established in 1794)
Alagappa College of Technology (ACT) (Established in 1944)
Madras Institute of Technology (MIT) (Established in 1949)
School of Architecture & Planning (SAP) (Established in 1957)`
};

export const DEPARTMENT_INFO = {
  name: "Department of Computer Science and Engineering",
  full_name: "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)",
  college: "College of Engineering, Guindy",
  motto: "Progress Through Knowledge",
  
  description: `The Department of Computer Science and Engineering aligns its goals towards providing quality education and improving competence among students thereby living up to its motto, 'Progress Through Knowledge'. Expert engineers produced by the department stand testimony to it.`,
  
  philosophy: `College of Engineering, Guindy has always asserted to take education beyond the four walls so that students understand the reality of the technical world.`,
  
  facilities_and_opportunities: `The Department imparts world class training and platform for research to the students. The department provides state-of-the-art computing facilities to the students enabling them to stay a step ahead. They are exposed to various opportunities such as inplant training, internships, and workshops during their course of study.`,
  
  full_about: `The Department of Computer Science and Engineering aligns its goals towards providing quality education and improving competence among students thereby living up to its motto, 'Progress Through Knowledge'. Expert engineers produced by the department stand testimony to it.

College of Engineering, Guindy has always asserted to take education beyond the four walls so that students understand the reality of the technical world.

The Department imparts world class training and platform for research to the students. The department provides state-of-the-art computing facilities to the students enabling them to stay a step ahead. They are exposed to various opportunities such as inplant training, internships, and workshops during their course of study.`
};

export const BROCHURE_CONSTANTS = {
  university: UNIVERSITY_INFO,
  department: DEPARTMENT_INFO,
  
  // Common brochure styling and layout constants
  colors: {
    primary: "#1976d2",
    secondary: "#dc004e",
    accent: "#ff9800",
    background: "#f5f5f5",
    text: "#333333"
  },
  
  fonts: {
    heading: "Arial, sans-serif",
    body: "Times New Roman, serif",
    accent: "Helvetica, sans-serif"
  },
  
  logos: {
    university: "/anna-university-logo.jpg",
    department: "/anna-university-logo.jpg" // Can be different if department has separate logo
  }
};

export const CONTACT_INFO = {
  university: {
    address: "Anna University, Chennai - 600 025, Tamil Nadu, India",
    website: "https://www.annauniv.edu",
    phone: "+91-44-2235 8000"
  },
  
  department: {
    address: "Department of Computer Science and Engineering, College of Engineering, Guindy, Anna University, Chennai - 600 025",
    email: "dcse@annauniv.edu",
    website: "https://www.annauniv.edu/ceg/cse"
  }
};

// Template sections that will appear in every brochure
export const STANDARD_BROCHURE_SECTIONS = {
  university_about: UNIVERSITY_INFO.full_about,
  department_about: DEPARTMENT_INFO.full_about,
  contact_info: CONTACT_INFO
};

// Organizing Committee Role Hierarchy and Structure
export const ORGANIZING_COMMITTEE = {
  roleCategories: {
    PATRON: {
      name: "Patron",
      order: 1,
      roles: [
        "Chief Patron",
        "Patron",
        "Co-Patron"
      ]
    },
    ADMINISTRATION: {
      name: "Administration",
      order: 2,
      roles: [
        "Vice-Chancellor", 
        "Pro-Vice-Chancellor",
        "Registrar",
        "Controller of Examinations",
        "Finance Officer"
      ]
    },
    ACADEMIC: {
      name: "Academic Leadership",
      order: 3,
      roles: [
        "Dean",
        "Associate Dean",
        "Head of Department",
        "Associate Head of Department"
      ]
    },
    ORGANIZING: {
      name: "Organizing Committee",
      order: 4,
      roles: [
        "Chairman",
        "Vice-Chairman", 
        "Secretary",
        "Joint Secretary",
        "Treasurer",
        "Convener",
        "Co-Convener"
      ]
    },
    COORDINATION: {
      name: "Coordination Committee",
      order: 5,
      roles: [
        "Coordinator",
        "Co-Coordinator",
        "Technical Coordinator",
        "Program Coordinator",
        "Registration Coordinator"
      ]
    },
    COMMITTEE: {
      name: "Committee Members",
      order: 6,
      roles: [
        "Member",
        "Student Member", 
        "External Member",
        "Industry Representative",
        "Guest Member",
        "Honorary Member",
        "Advisory Member"
      ]
    },
    EXTERNAL: {
      name: "External Participants",
      order: 7,
      roles: [
        "Industry Expert",
        "Government Official",
        "Research Scholar",
        "International Delegate",
        "Distinguished Guest",
        "Resource Person",
        "Subject Matter Expert"
      ]
    }
  },

  // Default organizing structure for events
  defaultStructure: [
    {
      roleCategory: "PATRON",
      role: "Chief Patron",
      name: "Vice-Chancellor",
      designation: "Vice-Chancellor",
      department: "Anna University",
      isDefault: true,
      description: "Overall patron of the event"
    },
    {
      roleCategory: "PATRON", 
      role: "Patron",
      name: "Registrar",
      designation: "Registrar",
      department: "Anna University",
      isDefault: true,
      description: "Administrative patron"
    },
    {
      roleCategory: "ACADEMIC",
      role: "Dean",
      name: "Dean",
      designation: "Dean",
      department: "College of Engineering, Guindy",
      isDefault: true,
      description: "Academic oversight"
    }
  ],

  // Common department/organization options for organizers
  commonOrganizations: [
    "Anna University",
    "College of Engineering, Guindy",
    "Alagappa College of Technology",
    "Madras Institute of Technology", 
    "School of Architecture & Planning",
    "Department of Computer Science and Engineering",
    "Department of Information Technology",
    "Department of Electronics and Communication Engineering",
    "Department of Electrical and Electronics Engineering",
    "Department of Mechanical Engineering",
    "Department of Civil Engineering",
    "Department of Chemical Engineering",
    "Department of Aerospace Engineering",
    "Department of Biomedical Engineering",
    "Department of Biotechnology",
    "Department of Management Studies",
    "External Organization",
    "Industry Partner",
    "Government Organization",
    "Research Institution",
    "Academic Institution",
    "Other"
  ],

  // Role permissions and restrictions
  roleRestrictions: {
    singleInstance: ["Chief Patron", "Vice-Chancellor", "Registrar", "Chairman"],
    multipleAllowed: [
      "Patron", "Co-Patron", "Dean", "Head of Department", "Associate Head of Department",
      "Member", "Student Member", "External Member", "Industry Representative", 
      "Guest Member", "Honorary Member", "Advisory Member", "Coordinator", "Co-Coordinator",
      "Technical Coordinator", "Program Coordinator", "Registration Coordinator",
      "Industry Expert", "Government Official", "Research Scholar", "International Delegate",
      "Distinguished Guest", "Resource Person", "Subject Matter Expert"
    ],
    requiresApproval: ["Chief Patron", "Patron", "Vice-Chancellor", "Registrar"],
    flexibleDepartment: [
      "Industry Expert", "Government Official", "Research Scholar", "International Delegate",
      "Distinguished Guest", "Resource Person", "Subject Matter Expert", "External Member",
      "Industry Representative", "Guest Member", "Honorary Member", "Advisory Member"
    ]
  },

  // Display order for brochures and documents
  displayOrder: [
    "Vice-Chancellor",
    "Pro-Vice-Chancellor",
    "Chief Patron",
    "Patron", 
    "Co-Patron",
    "Registrar",
    "Controller of Examinations",
    "Finance Officer",
    "Dean",
    "Associate Dean",
    "Head of Department",
    "Associate Head of Department",
    "Chairman",
    "Vice-Chairman",
    "Secretary", 
    "Joint Secretary",
    "Treasurer",
    "Convener",
    "Co-Convener",
    "Coordinator",
    "Co-Coordinator", 
    "Technical Coordinator",
    "Program Coordinator",
    "Registration Coordinator",
    "Member",
    "Student Member",
    "External Member",
    "Industry Representative",
    "Guest Member",
    "Honorary Member",
    "Advisory Member",
    "Industry Expert",
    "Government Official",
    "Research Scholar",
    "International Delegate",
    "Distinguished Guest",
    "Resource Person",
    "Subject Matter Expert"
  ]
};
