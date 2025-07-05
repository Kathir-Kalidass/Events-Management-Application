import event from "../../models/eventModel.js";
import user from "../../models/userModel.js";
import ConvenorCommittee from "../../models/convenorCommitteeModel.js";
import PDFDocument from "pdfkit";
import pkg from "number-to-words";
const { toWords } = pkg;

// Create a new training programme
export const createProgramme = async (req, res) => {
  try {

    if (!req.body.title || !req.body.startDate || !req.body.endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const programme = new event({
      title: req.body.title,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      venue: req.body.venue,
      mode: req.body.mode || "Online",
      duration: req.body.duration,
      type: req.body.type,
      objectives: req.body.objectives,
      outcomes: req.body.outcomes,
      budget: Number(req.body.budget) || 0,
      coordinators: JSON.parse(req.body.coordinators || "[]"),
      targetAudience: JSON.parse(req.body.targetAudience || "[]"),
      resourcePersons: JSON.parse(req.body.resourcePersons || "[]"),
      approvers: JSON.parse(req.body.approvers || "[]"),
      budgetBreakdown: JSON.parse(req.body.budgetBreakdown || "{}"),
      // Handle organizing departments
      organizingDepartments: JSON.parse(req.body.organizingDepartments || '{"primary":"DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)","associative":[]}'),
      // Handle department approvers
      departmentApprovers: JSON.parse(req.body.departmentApprovers || '[{"department":"DCSE","hodName":"","hodDesignation":"HOD of DCSE","approved":false,"approvedDate":null,"signature":""}]'),
      // Handle registration procedure
      registrationProcedure: JSON.parse(req.body.registrationProcedure || '{"enabled":false}'),
      createdBy: req.body.createdBy,
      reviewedBy: req.body.reviewedBy,
    });

    if (req.file) {
      programme.brochure = {
        fileName: req.file.filename,
        filePath: req.file.path,
        contentType: req.file.mimetype,
      };
    }

    const savedProgramme = await programme.save();
    res.status(201).json(savedProgramme);
  } catch (error) {
    console.error("❌ Error creating programme:", error);
    res.status(500).json({
      message: "Error creating programme",
      error: error.message,
    });
  }
};
//TrainingProgramme
// Get all programmes
export const getProgrammes = async (req, res) => {
  try {
    const programmes = await event
      .find({})
      .select("-brochure")
      .sort({ createdAt: -1 });
    res.json(programmes);
  } catch (error) {
    console.error("❌ Error fetching programmes:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get single programme by ID
export const getProgrammeById = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    // Fetch organizing committee data
    const organizingCommittee = await ConvenorCommittee.find({ 
      isActive: true
    }).sort({ 
      roleCategory: 1, 
      role: 1,
      createdAt: -1 
    });

    // Add organizing committee to the response
    const programmeWithCommittee = {
      ...programme.toObject(),
      organizingCommittee
    };

    res.json(programmeWithCommittee);
  } catch (error) {
    console.error("❌ Error fetching programme:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update programme
export const updateProgramme = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    // Helper function to safely parse JSON
    const safeJSONParse = (jsonString, fieldName) => {
      if (!jsonString) return null;
      
      // Handle case where jsonString might be an array (due to duplicate form submissions)
      if (Array.isArray(jsonString)) {
        jsonString = jsonString[0];
      }
      
      try {
        return JSON.parse(jsonString);
      } catch (error) {
        console.error(`❌ Error parsing ${fieldName} JSON:`, error.message);
        console.error(`Raw ${fieldName} data:`, jsonString);
        throw new Error(`Invalid ${fieldName} JSON format: ${error.message}`);
      }
    };

    const {
      title,
      startDate,
      endDate,
      venue,
      mode,
      duration,
      type,
      objectives,
      outcomes,
      budget,
      coordinators,
      targetAudience,
      resourcePersons,
      registrationFees,
      approvers,
      paymentDetails,
      budgetBreakdown,
      organizingDepartments,
      departmentApprovers,
      registrationProcedure,
    } = req.body;

    programme.title = title || programme.title;
    programme.startDate = startDate ? new Date(startDate) : programme.startDate;
    programme.endDate = endDate ? new Date(endDate) : programme.endDate;
    programme.venue = venue || programme.venue;
    programme.mode = mode || programme.mode;
    programme.duration = duration || programme.duration;
    programme.type = type || programme.type;
    programme.objectives = objectives || programme.objectives;
    programme.outcomes = outcomes || programme.outcomes;
    programme.budget = budget ? Number(budget) : programme.budget;
    
    // Use safe JSON parsing for all complex fields
    programme.coordinators = coordinators
      ? safeJSONParse(coordinators, "coordinators")
      : programme.coordinators;
    programme.targetAudience = targetAudience
      ? safeJSONParse(targetAudience, "targetAudience")
      : programme.targetAudience;
    programme.resourcePersons = resourcePersons
      ? safeJSONParse(resourcePersons, "resourcePersons")
      : programme.resourcePersons;
    programme.approvers = approvers
      ? safeJSONParse(approvers, "approvers")
      : programme.approvers;
    programme.budgetBreakdown = budgetBreakdown
      ? safeJSONParse(budgetBreakdown, "budgetBreakdown")
      : programme.budgetBreakdown;

    // Handle organizing departments and department approvers
    programme.organizingDepartments = organizingDepartments
      ? safeJSONParse(organizingDepartments, "organizingDepartments")
      : programme.organizingDepartments;
    
    programme.departmentApprovers = departmentApprovers
      ? safeJSONParse(departmentApprovers, "departmentApprovers")
      : programme.departmentApprovers;

    // Handle registration procedure with safe parsing
    if (registrationProcedure) {
      programme.registrationProcedure = safeJSONParse(registrationProcedure, "registrationProcedure");
    }

    if (req.file) {
      programme.brochure = {
        fileName: req.file.filename,
        filePath: req.file.path,
        contentType: req.file.mimetype,
      };
    }

    const updatedProgramme = await programme.save();
    res.json(updatedProgramme);
  } catch (error) {
    console.error("❌ Error updating programme:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete programme
export const deleteProgramme = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }
    await programme.deleteOne();
    res.json({ message: "Programme removed" });
  } catch (error) {
    console.error("❌ Error deleting programme:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
// Handle claim bill submission
export const handleClaimBillSubmission = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    const { expenses } = req.body;

    if (!Array.isArray(expenses) || expenses.length === 0) {
      return res
        .status(400)
        .json({ message: "Expenses should be a non-empty array" });
    }

    // Calculate total expenditure from claim expenses
    const totalClaimExpenditure = expenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );

    // ✅ Store under new 'claimBill' field
    programme.claimBill = {
      expenses,
      totalExpenditure: totalClaimExpenditure,
    };

    // ✅ IMPORTANT: Also update the main budgetBreakdown to reflect actual claim amounts
    // This ensures the HOD finance view shows updated expenditure
    if (programme.budgetBreakdown) {
      // Update the main budget breakdown with actual claim expenses
      programme.budgetBreakdown.expenses = expenses;
      programme.budgetBreakdown.totalExpenditure = totalClaimExpenditure;
      
      // Recalculate total including university overhead if it exists
      if (programme.budgetBreakdown.universityOverhead) {
        programme.budgetBreakdown.totalExpenditure += Number(programme.budgetBreakdown.universityOverhead);
      }
    }

    await programme.save();

    res.status(200).json({ 
      message: "Claim bill stored successfully", 
      totalExpenditure: programme.budgetBreakdown.totalExpenditure 
    });
  } catch (error) {
    console.error("❌ Error submitting claim bill:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// ... (your existing imports and other controller functions)
export const generateProgrammePDF = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }
    
    // Fetch convenor committee members
    const convenorMembers = await ConvenorCommittee.find({ isActive: true })
      .sort({ role: -1, createdAt: -1 }); // Chairman first, then by creation date

    const doc = new PDFDocument({ margin: 50 });
    const filename = `NoteOrder_${programme.title.replace(/\s+/g, "_")}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(res);

    // HEADER - Dynamic department names
    const primaryDept = programme.organizingDepartments?.primary || "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)";
    const associativeDepts = programme.organizingDepartments?.associative || [];
    
    // Helper function to get department abbreviations
    const getDeptAbbreviation = (deptName) => {
      if (deptName.includes("ELECTRICAL") && deptName.includes("ELECTRONICS")) return "EEE";
      if (deptName.includes("CYBER SECURITY")) return "CCS";
      if (deptName.includes("INFORMATION TECHNOLOGY")) return "IT";
      if (deptName.includes("ELECTRONICS") && deptName.includes("COMMUNICATION")) return "ECE";
      if (deptName.includes("MECHANICAL")) return "MECH";
      if (deptName.includes("CIVIL")) return "CIVIL";
      if (deptName.includes("COMPUTER SCIENCE")) return "DCSE";
      // Fallback: extract capital letters
      return deptName.replace(/[^A-Z]/g, '');
    };
    
    // Helper function for department full names with proper formatting
    const getDeptFullName = (deptName) => {
      if (!deptName) return "UNKNOWN DEPARTMENT";
      if (deptName.includes("CYBER SECURITY")) return "Centre for Cyber Security (CCS)";
      if (deptName.includes("COMPUTER SCIENCE")) return "Department of Computer Science and Engineering (DCSE)";
      if (deptName.includes("ELECTRICAL") && deptName.includes("ELECTRONICS")) return "Department of Electrical and Electronics Engineering (EEE)";
      if (deptName.includes("INFORMATION TECHNOLOGY")) return "Department of Information Technology (IT)";
      if (deptName.includes("ELECTRONICS") && deptName.includes("COMMUNICATION")) return "Department of Electronics and Communication Engineering (ECE)";
      if (deptName.includes("MECHANICAL")) return "Department of Mechanical Engineering (MECH)";
      if (deptName.includes("CIVIL")) return "Department of Civil Engineering (CIVIL)";
      return deptName; // Return as-is for other departments
    };
    
    // Helper function for Centre header text (shows abbreviated form)
    const getCentreHeaderText = (primary, associative) => {
      const primaryAbbrev = getDeptAbbreviation(primary);
      if (associative.length === 0) {
        return `DEPARTMENT OF ${primaryAbbrev}`;
      }
      const associativeAbbrevs = associative.map(d => getDeptAbbreviation(d));
      return `DEPARTMENT OF ${primaryAbbrev} & ${associativeAbbrevs.map(abbrev => 
        abbrev === 'CCS' ? 'CENTRE FOR CYBER SECURITY' : `DEPARTMENT OF ${abbrev}`
      ).join(' & ')}`;
    };
    
    // Create department header text
    let deptHeaderText = primaryDept;
    if (associativeDepts.length > 0) {
      deptHeaderText += ` & ${associativeDepts.join(" & ")}`;
    }
    
    // Create abbreviations for Letter No
    const primaryAbbrev = getDeptAbbreviation(primaryDept);
    const associativeAbbrevs = associativeDepts.map(d => getDeptAbbreviation(d));
    const letterNoAbbrev = associativeAbbrevs.length > 0 
      ? `${primaryAbbrev}&${associativeAbbrevs.join('&')}`
      : primaryAbbrev;
    
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`Centre  :  ${getCentreHeaderText(primaryDept, associativeDepts)}`)
      .moveDown(0.3)
      .text(
        `Letter No.:  Lr. No. 1/TrainingProgramme/${letterNoAbbrev}/${new Date().getFullYear()}`
      )
      .text(`Date      :  ${new Date().toLocaleDateString("en-IN")}`)
      .moveDown(1.2);

    // TITLE
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("NOTE SUBMITTED TO THE CONVENOR COMMITTEE:", {
        align: "center",
        underline: true,
      })
      .moveDown();

    // SUBJECT - Dynamic departments using standardized abbreviations
    const subjectDepts = associativeDepts.length > 0 
      ? `DCSE & ${associativeDepts.map(d => getDeptAbbreviation(d)).join(" & ")}`
      : "DCSE";
    
    doc
      .font("Helvetica")
      .text(`Sub: ${subjectDepts} – Request for `, { continued: true })
      .font("Helvetica-Bold")
      .text("Permission and Approval", { continued: true })
      .font("Helvetica")
      .text(" to conduct a ", { continued: true })
      .font("Helvetica-Bold")
      .text(`${programme.duration} ${programme.mode} Training Programme`, {
        continued: true,
      })
      .text(" on ", { continued: true })
      .text(`“${programme.title}”`, { continued: true })
      .font("Helvetica")
      .text(" - reg.")
      .moveDown()
      .font("Helvetica-Bold")
      .text("******", { align: "center" })
      .moveDown();

    // PARAGRAPH
    const startDate = new Date(programme.startDate);
    const endDate = new Date(programme.endDate);
    const month = startDate.toLocaleString("default", { month: "long" });
    const year = startDate.getFullYear();

    // Create dynamic department text for the paragraph
    const primaryFullName = getDeptFullName(primaryDept);
    let paragraphDeptText = primaryFullName;
    if (associativeDepts.length > 0) {
      const associativeFullNames = associativeDepts.map(d => getDeptFullName(d));
      if (associativeFullNames.length === 1) {
        paragraphDeptText += ` and the ${associativeFullNames[0]}`;
      } else {
        const lastDept = associativeFullNames.pop();
        paragraphDeptText += `, ${associativeFullNames.join(", ")} and the ${lastDept}`;
      }
    }

    doc
      .font("Helvetica")
      .text(
        `The ${paragraphDeptText} seek kind permission and approval to organize a ${
          programme.duration
        } ${programme.mode} Training Programme titled “${
          programme.title
        }” in the month of ${month}, ${year} [Tentative Dates: ${startDate.toLocaleDateString(
          "en-IN"
        )} and ${endDate.toLocaleDateString(
          "en-IN"
        )}] with ${programme.coordinators
          .map((c) => `Dr. ${c.name}`)
          .join(" and ")} as coordinators.`,
        { width: 500, align: 'justify' }
      )
      .moveDown();

    // Advanced AI-powered content generator with sophisticated NLP and content refinement
    const generateProgrammeDescription = (programme) => {
      const title = programme.title || "Training Programme";
      const rawObjectives = programme.objectives || "";
      const rawOutcomes = programme.outcomes || "";
      const targetAudience = programme.targetAudience || [];
      
      // Advanced content refinement using AI techniques
      const refinedObjectives = refineObjectives(rawObjectives, title);
      const refinedOutcomes = refineOutcomes(rawOutcomes, title, refinedObjectives);
      
      // Extract key concepts and technologies from the title
      const keyTerms = extractKeyTerms(title);
      const domain = identifyDomain(title.toLowerCase());
      const complexity = assessComplexity(title, refinedObjectives);
      const taxonomyLevel = assessBloomsTaxonomy(refinedObjectives, refinedOutcomes);
      
      // Generate context-aware description using refined content
      const description = generateContextualDescription(title, refinedObjectives, refinedOutcomes, domain, keyTerms, complexity, taxonomyLevel);
      
      // Generate dynamic target skills based on actual content
      const targetSkills = generateTargetSkills(targetAudience, domain, keyTerms);
      
      // Generate applications based on refined objectives and outcomes
      const applications = generateApplications(refinedObjectives, refinedOutcomes, domain);
      
      return {
        description: description,
        targetSkills: targetSkills,
        applications: applications,
        refinedObjectives: refinedObjectives,
        refinedOutcomes: refinedOutcomes
      };
    };
    
    // Extract meaningful terms from the title
    function extractKeyTerms(title) {
      const techTerms = ['machine learning', 'ai', 'artificial intelligence', 'deep learning', 'neural networks', 
                        'python', 'java', 'javascript', 'react', 'node.js', 'database', 'sql', 'mongodb',
                        'cloud', 'aws', 'azure', 'docker', 'kubernetes', 'microservices', 'api',
                        'cybersecurity', 'blockchain', 'iot', 'data science', 'analytics', 'visualization',
                        'web development', 'mobile app', 'android', 'ios', 'flutter', 'react native',
                        'latex', 'research', 'documentation', 'automation', 'testing', 'devops'];
      
      const foundTerms = techTerms.filter(term => 
        title.toLowerCase().includes(term.toLowerCase())
      );
      
      return foundTerms.length > 0 ? foundTerms : [title.toLowerCase()];
    }
    
    // Identify the primary domain of the training
    function identifyDomain(titleLower) {
      if (titleLower.includes('machine learning') || titleLower.includes('ai') || titleLower.includes('artificial intelligence')) {
        return 'AI/ML';
      } else if (titleLower.includes('web') || titleLower.includes('frontend') || titleLower.includes('backend')) {
        return 'Web Development';
      } else if (titleLower.includes('data') || titleLower.includes('analytics') || titleLower.includes('visualization')) {
        return 'Data Science';
      } else if (titleLower.includes('security') || titleLower.includes('cyber')) {
        return 'Cybersecurity';
      } else if (titleLower.includes('cloud') || titleLower.includes('aws') || titleLower.includes('azure')) {
        return 'Cloud Computing';
      } else if (titleLower.includes('mobile') || titleLower.includes('android') || titleLower.includes('ios')) {
        return 'Mobile Development';
      } else if (titleLower.includes('research') || titleLower.includes('documentation') || titleLower.includes('latex')) {
        return 'Academic/Research';
      } else if (titleLower.includes('programming') || titleLower.includes('coding') || titleLower.includes('software')) {
        return 'Software Development';
      }
      return 'Technology';
    }
    
    // Assess complexity level based on title and objectives
    function assessComplexity(title, objectives) {
      const titleLower = title.toLowerCase();
      const objectivesLower = (objectives || '').toLowerCase();
      
      const advancedTerms = ['advanced', 'deep', 'complex', 'enterprise', 'production', 'scalable', 'optimization'];
      const intermediateTerms = ['intermediate', 'practical', 'implementation', 'development', 'application'];
      const beginnerTerms = ['introduction', 'basic', 'fundamentals', 'getting started', 'beginner'];
      
      const text = titleLower + ' ' + objectivesLower;
      
      if (advancedTerms.some(term => text.includes(term))) return 'advanced';
      if (intermediateTerms.some(term => text.includes(term))) return 'intermediate';
      if (beginnerTerms.some(term => text.includes(term))) return 'beginner';
      
      return 'intermediate'; // default
    }
    
    // Generate contextual description based on all inputs including refined content
    function generateContextualDescription(title, refinedObjectives, refinedOutcomes, domain, keyTerms, complexity, taxonomyLevel) {
      // Advanced description templates by complexity and taxonomy level
      const templates = {
        beginner: {
          remembering: "This foundational training programme introduces participants to the fundamental concepts of",
          understanding: "This comprehensive introductory programme provides participants with essential understanding of",
          applying: "This practical training programme enables participants to apply basic concepts of",
          analyzing: "This analytical training programme helps participants examine and understand",
          evaluating: "This evaluative training programme develops participants' ability to assess",
          creating: "This creative foundational programme empowers participants to build innovative solutions using"
        },
        intermediate: {
          remembering: "This comprehensive training programme provides in-depth coverage of",
          understanding: "This advanced programme offers thorough understanding and interpretation of",
          applying: "This practical programme focuses on real-world application and implementation of",
          analyzing: "This analytical programme develops expertise in examining and dissecting complex",
          evaluating: "This evaluative programme builds critical assessment skills for",
          creating: "This innovative programme empowers participants to design and develop"
        },
        advanced: {
          remembering: "This specialized expert-level programme provides comprehensive mastery of",
          understanding: "This advanced programme offers deep theoretical and practical understanding of",
          applying: "This professional programme focuses on sophisticated application and optimization of",
          analyzing: "This expert-level programme develops advanced analytical capabilities for",
          evaluating: "This advanced programme builds expert-level evaluation and assessment skills for",
          creating: "This cutting-edge programme empowers participants to innovate and create breakthrough solutions using"
        }
      };
      
      const baseDescription = templates[complexity][taxonomyLevel];
      
      // Enhanced domain-specific context with refined objectives integration
      let domainContext = "";
      switch(domain) {
        case 'AI/ML':
          domainContext = "artificial intelligence and machine learning technologies, covering advanced algorithm development, neural network architectures, model optimization, and enterprise-scale deployment strategies";
          break;
        case 'Web Development':
          domainContext = "modern web development ecosystems, including cutting-edge frameworks, microservices architecture, progressive web applications, and full-stack development methodologies";
          break;
        case 'Data Science':
          domainContext = "data science and analytics methodologies, encompassing statistical modeling, machine learning integration, big data processing, and advanced visualization techniques for strategic decision-making";
          break;
        case 'Cybersecurity':
          domainContext = "cybersecurity frameworks and advanced threat management, including penetration testing, risk assessment, compliance management, and incident response strategies for enterprise environments";
          break;
        case 'Cloud Computing':
          domainContext = "cloud computing architectures and distributed systems, covering containerization, serverless computing, multi-cloud strategies, and scalable infrastructure design";
          break;
        case 'Academic/Research':
          domainContext = "academic research excellence and scholarly communication, including advanced research methodologies, peer review processes, and professional publication standards";
          break;
        default:
          domainContext = `${title.toLowerCase()} technologies and advanced methodologies, providing comprehensive coverage of theoretical foundations, practical implementations, and industry applications`;
      }
      
      // Sophisticated objective integration using refined content
      let objectiveIntegration = "";
      if (refinedObjectives && refinedObjectives.trim()) {
        const cleanObjectives = refinedObjectives.trim().replace(/[.!?]+$/, '');
        objectiveIntegration = ` The programme is meticulously designed to ${cleanObjectives.toLowerCase()}, ensuring participants achieve both theoretical mastery and practical excellence through hands-on learning experiences.`;
      }
      
      // Advanced outcome integration with refined content
      let outcomeIntegration = "";
      if (refinedOutcomes && refinedOutcomes.trim()) {
        const cleanOutcomes = refinedOutcomes.trim().replace(/[.!?]+$/, '');
        outcomeIntegration = ` Upon successful completion, participants will ${cleanOutcomes.toLowerCase()}, positioning them as competent professionals ready to tackle industry challenges and contribute meaningfully to their respective domains.`;
      }
      
      // Add industry alignment and future readiness
      const industryAlignment = getIndustryAlignment(domain, taxonomyLevel);
      
      return `${baseDescription} ${domainContext}.${objectiveIntegration}${outcomeIntegration} ${industryAlignment}`;
    }
    
    // Get industry alignment text based on domain and taxonomy level
    function getIndustryAlignment(domain, taxonomyLevel) {
      const advancedLevels = ['analyzing', 'evaluating', 'creating'];
      const isAdvanced = advancedLevels.includes(taxonomyLevel);
      
      const alignmentTexts = {
        'AI/ML': isAdvanced 
          ? "This programme aligns with current industry demands for AI specialists and positions participants at the forefront of machine learning innovation."
          : "This programme addresses the growing industry need for AI-literate professionals and provides foundational skills for career advancement.",
        'Web Development': isAdvanced
          ? "This programme meets enterprise-level web development requirements and prepares participants for senior developer roles in modern tech organizations."
          : "This programme addresses industry demand for skilled web developers and provides essential skills for entering the dynamic tech industry.",
        'Data Science': isAdvanced
          ? "This programme aligns with enterprise data strategy requirements and prepares participants for leadership roles in data-driven organizations."
          : "This programme meets the industry's growing need for data-literate professionals and provides essential analytics skills.",
        'Cybersecurity': isAdvanced
          ? "This programme addresses critical cybersecurity leadership needs and prepares participants for senior security architect and consultant roles."
          : "This programme meets the urgent industry demand for cybersecurity professionals and provides essential security skills.",
        'Cloud Computing': isAdvanced
          ? "This programme aligns with enterprise cloud transformation initiatives and prepares participants for cloud architect and DevOps leadership roles."
          : "This programme addresses the industry's cloud adoption needs and provides essential skills for modern infrastructure management.",
        'Academic/Research': isAdvanced
          ? "This programme elevates research capabilities to international standards and prepares participants for academic leadership and scholarly excellence."
          : "This programme enhances academic productivity and prepares participants for successful research careers.",
        'default': isAdvanced
          ? "This programme addresses advanced industry requirements and prepares participants for leadership roles in their professional domains."
          : "This programme meets industry standards and provides essential skills for professional development and career growth."
      };
      
      return alignmentTexts[domain] || alignmentTexts['default'];
    }
    
    // Generate target skills based on actual audience and content
    function generateTargetSkills(targetAudience, domain, keyTerms) {
      let baseAudience = "students, professionals, and researchers";
      
      if (targetAudience && Array.isArray(targetAudience) && targetAudience.length > 0) {
        baseAudience = targetAudience.join(", ").toLowerCase();
      }
      
      // Add domain-specific professional categories
      const domainProfessionals = {
        'AI/ML': "data scientists, machine learning engineers, software developers",
        'Web Development': "web developers, full-stack engineers, UI/UX designers",
        'Data Science': "data analysts, business intelligence professionals, researchers",
        'Cybersecurity': "security analysts, IT administrators, risk management professionals",
        'Cloud Computing': "cloud architects, DevOps engineers, system administrators",
        'Academic/Research': "research scholars, academic faculty, technical writers"
      };
      
      const professionals = domainProfessionals[domain] || "technical professionals, industry practitioners";
      
      return `${baseAudience}, ${professionals}`;
    }
    
    // Generate applications based on refined objectives and outcomes
    function generateApplications(refinedObjectives, refinedOutcomes, domain) {
      const domainApplications = {
        'AI/ML': "intelligent systems development, predictive analytics automation, computer vision applications, natural language processing solutions",
        'Web Development': "enterprise web applications, progressive web apps, e-commerce platforms, real-time collaborative systems",
        'Data Science': "business intelligence dashboards, predictive modeling systems, data-driven decision support, advanced analytics platforms",
        'Cybersecurity': "security assessment frameworks, threat detection systems, compliance management solutions, incident response protocols",
        'Cloud Computing': "scalable microservices architectures, cloud-native applications, infrastructure automation, distributed system design",
        'Academic/Research': "scholarly publications, research proposals, technical documentation, academic presentations and conferences"
      };
      
      let baseApplications = domainApplications[domain] || "practical implementation projects, professional development initiatives, industry applications";
      
      // Extract enhanced applications from refined content
      const applicationsFromContent = extractApplicationsFromText(refinedObjectives, refinedOutcomes);
      
      if (applicationsFromContent.length > 0) {
        baseApplications = `${baseApplications}, ${applicationsFromContent.join(", ")}`;
      }
      
      // Add innovation and entrepreneurship applications for advanced content
      const isAdvancedContent = (refinedObjectives + refinedOutcomes).toLowerCase().includes('create') || 
                               (refinedObjectives + refinedOutcomes).toLowerCase().includes('innovate') ||
                               (refinedObjectives + refinedOutcomes).toLowerCase().includes('design');
      
      if (isAdvancedContent) {
        baseApplications += ", startup ventures, innovation projects, research and development initiatives";
      }
      
      return baseApplications;
    }
    
    // Extract application areas from objectives and outcomes text
    function extractApplicationsFromText(objectives, outcomes) {
      const text = ((objectives || '') + ' ' + (outcomes || '')).toLowerCase();
      const applications = [];
      
      const applicationPatterns = [
        { pattern: /develop.*?(application|system|solution|platform)/g, app: "system development" },
        { pattern: /build.*?(website|app|tool|framework)/g, app: "application building" },
        { pattern: /create.*?(model|algorithm|dashboard|interface)/g, app: "solution creation" },
        { pattern: /implement.*?(security|automation|optimization)/g, app: "implementation projects" },
        { pattern: /analyze.*?(data|performance|trends)/g, app: "analytical projects" },
        { pattern: /design.*?(architecture|system|interface)/g, app: "design projects" }
      ];
      
      applicationPatterns.forEach(({ pattern, app }) => {
        if (pattern.test(text) && !applications.includes(app)) {
          applications.push(app);
        }
      });
      
      return applications;
    }

    // Advanced AI Content Refinement Functions
    
    // Refine and enhance objectives using AI techniques
    function refineObjectives(rawObjectives, title) {
      if (!rawObjectives || rawObjectives.trim().length === 0) {
        return generateDefaultObjectives(title);
      }
      
      let refined = rawObjectives.trim();
      
      // 1. Grammar and structure enhancement
      refined = enhanceGrammar(refined);
      
      // 2. Technical terminology enhancement
      refined = enhanceTechnicalTerminology(refined, title);
      
      // 3. Action verb enhancement (Bloom's taxonomy)
      refined = enhanceActionVerbs(refined);
      
      // 4. Specificity enhancement
      refined = enhanceSpecificity(refined, title);
      
      // 5. Professional language polish
      refined = polishProfessionalLanguage(refined);
      
      return refined;
    }
    
    // Refine and enhance outcomes using AI techniques
    function refineOutcomes(rawOutcomes, title, refinedObjectives) {
      if (!rawOutcomes || rawOutcomes.trim().length === 0) {
        return generateDefaultOutcomes(title, refinedObjectives);
      }
      
      let refined = rawOutcomes.trim();
      
      // 1. Align with objectives
      refined = alignWithObjectives(refined, refinedObjectives);
      
      // 2. Enhance measurability
      refined = enhanceMeasurability(refined);
      
      // 3. Add industry relevance
      refined = addIndustryRelevance(refined, title);
      
      // 4. Enhance action-oriented language
      refined = enhanceActionOrientation(refined);
      
      // 5. Professional polish
      refined = polishProfessionalLanguage(refined);
      
      return refined;
    }
    
    // Generate default objectives if none provided
    function generateDefaultObjectives(title) {
      const domain = identifyDomain(title.toLowerCase());
      const keyTerms = extractKeyTerms(title);
      
      const defaultTemplates = {
        'AI/ML': `To provide comprehensive understanding of ${keyTerms.join(', ')} principles, methodologies, and practical applications. To develop proficiency in implementing advanced algorithms, model development, and data-driven solution design for real-world challenges.`,
        'Web Development': `To equip participants with modern ${keyTerms.join(', ')} technologies and frameworks. To develop practical skills in building responsive, scalable web applications and understanding full-stack development methodologies.`,
        'Data Science': `To provide in-depth knowledge of ${keyTerms.join(', ')} techniques and analytical methodologies. To develop expertise in data manipulation, statistical analysis, visualization, and extracting actionable insights from complex datasets.`,
        'Cybersecurity': `To develop comprehensive understanding of ${keyTerms.join(', ')} principles, threat analysis, and security implementation strategies. To build practical skills in risk assessment, security protocols, and incident response mechanisms.`,
        'Cloud Computing': `To provide thorough knowledge of ${keyTerms.join(', ')} platforms, architectures, and deployment strategies. To develop expertise in scalable system design, cloud migration, and distributed computing solutions.`,
        'Academic/Research': `To enhance ${keyTerms.join(', ')} skills and methodologies for academic excellence. To develop proficiency in research documentation, technical writing, and professional presentation techniques.`,
        'default': `To provide comprehensive knowledge and practical skills in ${title.toLowerCase()}. To develop professional competency and industry-relevant expertise in current technologies and methodologies.`
      };
      
      return defaultTemplates[domain] || defaultTemplates['default'];
    }
    
    // Generate default outcomes if none provided
    function generateDefaultOutcomes(title, objectives) {
      const domain = identifyDomain(title.toLowerCase());
      const keyTerms = extractKeyTerms(title);
      
      const defaultTemplates = {
        'AI/ML': `Participants will be able to design and implement machine learning models, analyze complex datasets, and develop intelligent systems. They will demonstrate proficiency in ${keyTerms.join(', ')} and apply these skills to solve industry-specific problems.`,
        'Web Development': `Participants will be able to create responsive web applications, implement modern development practices, and utilize ${keyTerms.join(', ')} effectively. They will demonstrate competency in full-stack development and industry best practices.`,
        'Data Science': `Participants will be able to perform advanced data analysis, create meaningful visualizations, and extract actionable insights from complex datasets. They will demonstrate expertise in ${keyTerms.join(', ')} and statistical methodologies.`,
        'Cybersecurity': `Participants will be able to assess security vulnerabilities, implement protection mechanisms, and develop comprehensive security strategies. They will demonstrate competency in ${keyTerms.join(', ')} and incident response procedures.`,
        'Cloud Computing': `Participants will be able to design cloud architectures, implement scalable solutions, and manage distributed systems effectively. They will demonstrate expertise in ${keyTerms.join(', ')} and cloud best practices.`,
        'Academic/Research': `Participants will be able to conduct systematic research, produce high-quality documentation, and present technical content professionally. They will demonstrate proficiency in ${keyTerms.join(', ')} and academic methodologies.`,
        'default': `Participants will be able to apply theoretical knowledge to practical scenarios, demonstrate technical competency, and contribute effectively to their professional domain. They will show proficiency in ${title.toLowerCase()} concepts and methodologies.`
      };
      
      return defaultTemplates[domain] || defaultTemplates['default'];
    }
    
    // Enhance grammar and sentence structure
    function enhanceGrammar(text) {
      // Fix common grammar issues
      let enhanced = text
        .replace(/\bi\b/g, 'I') // Capitalize standalone 'i'
        .replace(/\bto to\b/g, 'to') // Remove duplicate 'to'
        .replace(/\band and\b/g, 'and') // Remove duplicate 'and'
        .replace(/\s+/g, ' ') // Remove extra spaces
        .replace(/([.!?])\s*([a-z])/g, '$1 $2'.replace(/([.!?])\s*([a-z])/, (match, p1, p2) => p1 + ' ' + p2.toUpperCase())) // Capitalize after punctuation
        .trim();
      
      // Ensure proper sentence endings
      if (enhanced && !enhanced.match(/[.!?]$/)) {
        enhanced += '.';
      }
      
      return enhanced;
    }
    
    // Enhance technical terminology
    function enhanceTechnicalTerminology(text, title) {
      const domain = identifyDomain(title.toLowerCase());
      
      const terminologyMaps = {
        'AI/ML': {
          'ai': 'Artificial Intelligence (AI)',
          'ml': 'Machine Learning (ML)',
          'algorithm': 'advanced algorithms',
          'data': 'data science methodologies',
          'model': 'predictive models',
          'neural': 'neural networks',
          'deep learning': 'deep learning architectures'
        },
        'Web Development': {
          'web': 'web development',
          'frontend': 'front-end development',
          'backend': 'back-end systems',
          'api': 'RESTful APIs',
          'database': 'database management systems',
          'responsive': 'responsive design principles'
        },
        'Data Science': {
          'data': 'big data analytics',
          'analysis': 'statistical analysis',
          'visualization': 'data visualization techniques',
          'statistics': 'statistical methodologies',
          'analytics': 'advanced analytics'
        }
      };
      
      let enhanced = text;
      const termMap = terminologyMaps[domain] || {};
      
      Object.entries(termMap).forEach(([simple, enhanced_term]) => {
        const regex = new RegExp(`\\b${simple}\\b`, 'gi');
        enhanced = enhanced.replace(regex, enhanced_term);
      });
      
      return enhanced;
    }
    
    // Enhance action verbs using Bloom's taxonomy
    function enhanceActionVerbs(text) {
      const basicToAdvanced = {
        'learn': 'master',
        'know': 'comprehend',
        'understand': 'analyze and synthesize',
        'use': 'effectively utilize',
        'make': 'create and design',
        'do': 'implement and execute',
        'get': 'acquire and develop',
        'see': 'analyze and evaluate',
        'find': 'research and identify',
        'work': 'collaborate and contribute'
      };
      
      let enhanced = text;
      Object.entries(basicToAdvanced).forEach(([basic, advanced]) => {
        const regex = new RegExp(`\\b${basic}\\b`, 'gi');
        enhanced = enhanced.replace(regex, advanced);
      });
      
      return enhanced;
    }
    
    // Enhance specificity
    function enhanceSpecificity(text, title) {
      const keyTerms = extractKeyTerms(title);
      
      // Add specific technologies and methodologies
      let enhanced = text;
      
      // Replace generic terms with specific ones
      const genericToSpecific = {
        'programming': `programming in ${keyTerms.includes('python') ? 'Python' : keyTerms.includes('java') ? 'Java' : 'modern programming languages'}`,
        'software': `software applications and systems`,
        'technology': `cutting-edge technologies`,
        'methods': `industry-standard methodologies`,
        'tools': `professional-grade tools and frameworks`,
        'techniques': `advanced techniques and best practices`
      };
      
      Object.entries(genericToSpecific).forEach(([generic, specific]) => {
        const regex = new RegExp(`\\b${generic}\\b`, 'gi');
        enhanced = enhanced.replace(regex, specific);
      });
      
      return enhanced;
    }
    
    // Polish professional language
    function polishProfessionalLanguage(text) {
      const enhancements = {
        'very good': 'exceptional',
        'good': 'proficient',
        'nice': 'effective',
        'great': 'outstanding',
        'awesome': 'remarkable',
        'cool': 'innovative',
        'easy': 'accessible yet comprehensive',
        'hard': 'challenging and advanced',
        'big': 'substantial',
        'small': 'focused',
        'fast': 'efficient',
        'slow': 'thorough and methodical'
      };
      
      let polished = text;
      Object.entries(enhancements).forEach(([casual, professional]) => {
        const regex = new RegExp(`\\b${casual}\\b`, 'gi');
        polished = polished.replace(regex, professional);
      });
      
      return polished;
    }
    
    // Assess Bloom's taxonomy level
    function assessBloomsTaxonomy(objectives, outcomes) {
      const text = (objectives + ' ' + outcomes).toLowerCase();
      
      const taxonomyLevels = {
        'creating': ['create', 'design', 'develop', 'build', 'construct', 'produce', 'generate'],
        'evaluating': ['evaluate', 'assess', 'critique', 'judge', 'compare', 'contrast', 'validate'],
        'analyzing': ['analyze', 'examine', 'investigate', 'categorize', 'differentiate', 'organize'],
        'applying': ['apply', 'implement', 'execute', 'demonstrate', 'use', 'utilize', 'solve'],
        'understanding': ['understand', 'explain', 'interpret', 'summarize', 'classify', 'describe'],
        'remembering': ['remember', 'recall', 'identify', 'recognize', 'list', 'define']
      };
      
      let highestLevel = 'remembering';
      const levelOrder = ['remembering', 'understanding', 'applying', 'analyzing', 'evaluating', 'creating'];
      
      for (const [level, verbs] of Object.entries(taxonomyLevels)) {
        if (verbs.some(verb => text.includes(verb))) {
          const currentIndex = levelOrder.indexOf(level);
          const highestIndex = levelOrder.indexOf(highestLevel);
          if (currentIndex > highestIndex) {
            highestLevel = level;
          }
        }
      }
      
      return highestLevel;
    }
    
    // Align outcomes with objectives
    function alignWithObjectives(outcomes, objectives) {
      // Extract key action verbs and concepts from objectives
      const objectiveVerbs = extractActionVerbs(objectives);
      const objectiveConcepts = extractKeyConcepts(objectives);
      
      let aligned = outcomes;
      
      // Ensure outcomes use compatible action verbs
      if (objectiveVerbs.length > 0) {
        const outcomeVerbs = extractActionVerbs(outcomes);
        const missingVerbs = objectiveVerbs.filter(verb => !outcomeVerbs.includes(verb));
        
        if (missingVerbs.length > 0) {
          aligned += ` Additionally, participants will be able to ${missingVerbs.join(', ')} the concepts and methodologies covered.`;
        }
      }
      
      return aligned;
    }
    
    // Extract action verbs from text
    function extractActionVerbs(text) {
      const actionVerbs = ['analyze', 'apply', 'assess', 'build', 'create', 'design', 'develop', 'evaluate', 'examine', 'explain', 'implement', 'interpret', 'solve', 'understand', 'utilize'];
      const foundVerbs = [];
      
      actionVerbs.forEach(verb => {
        const regex = new RegExp(`\\b${verb}\\w*\\b`, 'gi');
        if (regex.test(text)) {
          foundVerbs.push(verb);
        }
      });
      
      return [...new Set(foundVerbs)];
    }
    
    // Extract key concepts from text
    function extractKeyConcepts(text) {
      // Remove common words and extract meaningful concepts
      const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
      
      const words = text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.includes(word));
      
      // Count frequency and return most common concepts
      const frequency = {};
      words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
      });
      
      return Object.entries(frequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);
    }
    
    // Enhance measurability of outcomes
    function enhanceMeasurability(outcomes) {
      let enhanced = outcomes;
      
      // Add measurable indicators
      const measurableIndicators = [
        'demonstrate proficiency in',
        'successfully complete',
        'effectively utilize',
        'accurately implement',
        'efficiently execute',
        'systematically apply'
      ];
      
      // Replace vague terms with measurable ones
      const vagueToMeasurable = {
        'know': 'demonstrate knowledge of',
        'understand': 'explain and apply',
        'be familiar with': 'effectively use',
        'learn about': 'master the concepts of',
        'gain experience': 'develop practical skills in'
      };
      
      Object.entries(vagueToMeasurable).forEach(([vague, measurable]) => {
        const regex = new RegExp(`\\b${vague}\\b`, 'gi');
        enhanced = enhanced.replace(regex, measurable);
      });
      
      return enhanced;
    }
    
    // Add industry relevance
    function addIndustryRelevance(outcomes, title) {
      const domain = identifyDomain(title.toLowerCase());
      
      const industryApplications = {
        'AI/ML': 'in real-world AI applications and industry-standard machine learning pipelines',
        'Web Development': 'following current industry best practices and modern development workflows',
        'Data Science': 'using industry-standard tools and methodologies for data-driven decision making',
        'Cybersecurity': 'adhering to industry security standards and compliance requirements',
        'Cloud Computing': 'implementing enterprise-grade cloud solutions and industry best practices',
        'Academic/Research': 'meeting academic standards and professional research methodologies',
        'default': 'applying industry-relevant skills and professional standards'
      };
      
      const relevanceText = industryApplications[domain] || industryApplications['default'];
      
      if (!outcomes.includes('industry') && !outcomes.includes('professional')) {
        return outcomes + ` These skills will be directly applicable ${relevanceText}.`;
      }
      
      return outcomes;
    }
    
    // Enhance action-oriented language in outcomes
    function enhanceActionOrientation(outcomes) {
      let enhanced = outcomes;
      
      // Ensure outcomes start with action verbs
      const sentences = enhanced.split(/[.!?]+/).filter(s => s.trim());
      const enhancedSentences = sentences.map(sentence => {
        let trimmed = sentence.trim();
        
        // If sentence doesn't start with an action verb, add one
        if (trimmed && !trimmed.match(/^(participants\s+will\s+)?(be\s+able\s+to\s+)?[a-z]+/i)) {
          trimmed = `Participants will be able to ${trimmed.toLowerCase()}`;
        }
        
        return trimmed;
      });
      
      return enhancedSentences.join('. ') + '.';
    }
    
    // Generate dynamic content
    const programmeContent = generateProgrammeDescription(programme);

    doc
      .text(programmeContent.description, { width: 500, align: 'justify' })
      .moveDown();

    // PROGRAMME DETAILS
    doc
      .font("Helvetica-Bold")
      .text("The Training Programme Details are as follows:")
      .moveDown(0.5);

    doc.font("Courier-Bold");
    const labelWidth = 18;
    
    const details = [
      { 
        label: "Mode", 
        value: programme.mode === "Offline" 
          ? programme.mode 
          : `${programme.mode} (via MS Teams/G meet/Zoom)` 
      },
      { label: "Duration", value: programme.duration },
      { label: "Target Audience", value: Array.isArray(programme.targetAudience) ? programme.targetAudience.join(", ") : programme.targetAudience.split(",").map(item => item.trim()).join(", ") },
      {
        label: "Resource Persons",
        value: Array.isArray(programme.resourcePersons) ? programme.resourcePersons.join(", ") : programme.resourcePersons.split(",").map(item => item.trim()).join(", "),
      },
    ];
    
    details.forEach(({ label, value }) => {
      const paddedLabel = label.padEnd(labelWidth, " ");
      doc.text(`${paddedLabel}: ${value}`, { width: 450, continued: false });
    });

    doc
      .moveDown(2)
      .font("Helvetica")
      .text(
        "It is requested that permission may be granted to conduct the training programme and to host the details in the Anna University website. It is also requested that permission may be granted to collect registration fee from the participants as detailed in the table below. The tentative budget for the training programme is given in the annexure attached.",
        { width: 500, align: 'justify' }
      )
      .moveDown();

    // REGISTRATION FEE TABLE — BOXED AND ALIGNED
    const fees = programme.budgetBreakdown?.income || [];
    doc
      .font("Helvetica-Bold")
      .text("Registration Fee Structure:", { underline: true })
      .moveDown(0.5);

    const tableX = 50;
    const tableY = doc.y;
    const colWidths = [60, 200, 220];
    const rowHeight = 25;

    // Draw table box
    doc
      .rect(
        tableX,
        tableY,
        colWidths.reduce((a, b) => a + b),
        rowHeight * (fees.length + 1)
      )
      .stroke();

    // Table Headers
    doc
      .font("Helvetica-Bold")
      .text("Sl. No.", tableX + 5, tableY + 7)
      .text("Category", tableX + colWidths[0] + 5, tableY + 7)
      .text(
        "Registration Fee",
        tableX + colWidths[0] + colWidths[1] + 5,
        tableY + 7
      );

    // Table Rows
    doc.font("Helvetica");
    fees.forEach((fee, i) => {
      const y = tableY + rowHeight * (i + 1) + 7;
      doc
        .text(`${i + 1}`, tableX + 5, y)
        .text(fee.category || "", tableX + colWidths[0] + 5, y)
        .text(
          `Rs. ${fee.perParticipantAmount || 0}/- + ${fee.gstPercentage || 0}% GST`,
          tableX + colWidths[0] + colWidths[1] + 5,
          y
        );
    });

    doc.moveDown(fees.length + 2);
    doc
      .text(
        'Hence, it is kindly requested that permission may be given to conduct the training programme and the registration fees may be collected in the form of Demand Draft / Online payment favouring "The Director, CSRC, Anna University, Chennai".',
        { width: 500, align: 'justify' }
      )
      .moveDown(2);

    // COORDINATORS & SIGNATURES - Dynamic departments
    doc.fontSize(10);
    let currentY = doc.y;
    
    // Helper function for department abbreviations (local copy)
    const getDeptAbbreviationLocal = (deptName) => {
      if (!deptName) return "UNKNOWN";
      if (deptName.includes("ELECTRICAL") && deptName.includes("ELECTRONICS")) return "EEE";
      if (deptName.includes("CYBER SECURITY")) return "CCS";
      if (deptName.includes("INFORMATION TECHNOLOGY")) return "IT";
      if (deptName.includes("ELECTRONICS") && deptName.includes("COMMUNICATION")) return "ECE";
      if (deptName.includes("MECHANICAL")) return "MECH";
      if (deptName.includes("CIVIL")) return "CIVIL";
      if (deptName.includes("COMPUTER SCIENCE")) return "DCSE";
      // Fallback: extract capital letters
      return deptName.replace(/[^A-Z]/g, '') || "DEPT";
    };
    
    // Build dynamic signatory list
    const signatories = [];
    
    // Add coordinators section
    signatories.push({
      title: "Co-ordinator(s)",
      names: programme.coordinators.map(coord => `(Dr. ${coord.name})`)
    });
    
    // Add HODs for all departments - but only for the actually selected departments
    const departmentApprovers = programme.departmentApprovers || [];
    
    // Get the actual departments that should have HODs based on organizing departments
    const shouldHaveHODs = new Set();
    
    // Always include primary department (DCSE)
    shouldHaveHODs.add("DCSE");
    shouldHaveHODs.add("COMPUTER SCIENCE");
    
    // Add associative departments
    associativeDepts.forEach(dept => {
      const abbrev = getDeptAbbreviationLocal(dept);
      shouldHaveHODs.add(abbrev);
      shouldHaveHODs.add(dept.toUpperCase());
      
      // Add common variations
      if (abbrev === "EEE") {
        shouldHaveHODs.add("ELECTRICAL");
        shouldHaveHODs.add("ELECTRONICS");
      }
    });
    
    // Filter approvers to only include those for relevant departments
    const relevantApprovers = departmentApprovers.filter(approver => {
      if (!approver?.department) return false;
      
      const deptUpper = approver.department.trim().toUpperCase();
      
      // Check if this department is relevant
      const isRelevant = Array.from(shouldHaveHODs).some(relevantDept => 
        deptUpper.includes(relevantDept) || relevantDept.includes(deptUpper)
      );
      
      return isRelevant;
    });
    
    // Remove duplicates and filter out incomplete department names
    const deptNames = relevantApprovers.map(a => a.department?.trim()).filter(Boolean);
    const filteredApprovers = relevantApprovers.filter(approver => {
      if (!approver?.department) return false;
      
      const currentDept = approver.department.trim();
      
      // Skip if this is a substring of another department name
      const isSubstring = deptNames.some(otherDept => 
        otherDept !== currentDept && 
        otherDept.includes(currentDept) && 
        otherDept.length > currentDept.length
      );
      
      return !isSubstring;
    });
    
    // Process filtered approvers and remove final duplicates
    const uniqueDepartments = new Set();
    const validApprovers = [];
    
    filteredApprovers.forEach(approver => {
      if (approver && approver.department) {
        const deptKey = approver.department.trim().toUpperCase();
        if (!uniqueDepartments.has(deptKey)) {
          uniqueDepartments.add(deptKey);
          validApprovers.push(approver);
        }
      }
    });
    
    if (validApprovers.length > 0) {
      validApprovers.forEach(approver => {
        // Use standardized HOD title instead of the potentially messy hodDesignation
        const deptAbbrev = getDeptAbbreviationLocal(approver.department);
        const title = `HOD of ${deptAbbrev}`;
        
        signatories.push({
          title: title,
          names: []
        });
      });
    } else {
      // Fallback to default DCSE if no department approvers
      signatories.push({
        title: "HOD of DCSE",
        names: []
      });
    }
    
    // Add standard signatories
    signatories.push({
      title: "DIRECTOR, CSRC",
      names: []
    });
    signatories.push({
      title: "REGISTRAR", 
      names: []
    });
    
    // Calculate optimal layout
    const pageWidth = 550;
    const marginLeft = 50;
    const availableWidth = pageWidth - marginLeft;
    const numCols = Math.min(signatories.length, 4); // Max 4 columns to avoid crowding
    const colWidth = availableWidth / numCols;
    
    // Render signatures in a grid layout
    doc.font("Helvetica-Bold");
    signatories.forEach((signatory, i) => {
      const col = i % numCols;
      const row = Math.floor(i / numCols);
      const x = marginLeft + col * colWidth;
      const y = currentY + row * 80; // 80px spacing between rows
      
      // Title
      doc.text(signatory.title, x, y, { width: colWidth - 10, align: 'left' });
      
      // Names (for coordinators)
      if (signatory.names.length > 0) {
        doc.font("Helvetica");
        signatory.names.forEach((name, nameIdx) => {
          doc.text(name, x, y + 15 + nameIdx * 12, { width: colWidth - 10, align: 'left' });
        });
        doc.font("Helvetica-Bold");
      }
    });
    
    // Move down past all signatures
    const numRows = Math.ceil(signatories.length / numCols);
    doc.y = currentY + numRows * 80 + 20;

    // APPROVAL
    doc
      .moveDown(1)
      .font("Helvetica-Bold")
      .text("APPROVED / NOT APPROVED", { align: "center" })
      .moveDown(1);
    
    // Dynamic convenor committee members - Show only Chairman
    if (convenorMembers.length > 0) {
      // Find chairman
      const chairman = convenorMembers.find(member => member.role === 'Chairman');
      
      // Render only chairman
      if (chairman) {
        doc.font("Helvetica-Bold")
          .text(`${chairman.name}`, { align: "center" })
          .text(`${chairman.designation}`, { align: "center" });
        
        if (chairman.department) {
          doc.text(`${chairman.department}`, { align: "center" });
        }
        
        doc.text("Anna University, Chennai - 25.", { align: "center" });
        
        doc.text("CHAIRMAN", { align: "center" });
      } else {
        doc.text("CHAIRMAN", { align: "center" });
      }
      
      doc.text("Convenor Committee, Anna University", { align: "center" });
    } else {
      // Fallback to default structure if no members found
      doc.text("CHAIRMAN", { align: "center" });
      doc.text("Convenor Committee, Anna University", { align: "center" });
    }

    // PAGE 2 — TENTATIVE BUDGET
    doc.addPage();
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("TENTATIVE BUDGET", { align: "center", underline: true })
      .moveDown();

    // INCOME
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Income", { underline: true })
      .moveDown(0.5);
    doc.font("Helvetica");
    fees.forEach((inc) => {
      const expected = inc.expectedParticipants || 0;
      const amt = inc.perParticipantAmount || 0;
      const gst = inc.gstPercentage || 0;
      const total = expected * amt * (1 + gst / 100);
      doc.text(
        `${
          inc.category
        } = ${expected} × Rs. ${amt} + ${gst}% GST = Rs. ${total.toFixed(2)}/-`
      );
    });

    doc.moveDown();

    // EXPENDITURE TABLE
    doc
      .font("Helvetica-Bold")
      .text("Expenditure:", { underline: true })
      .moveDown(0.5);

    // Use claim bill expenses if available, otherwise use budget breakdown expenses
    const activeExpenses = programme.claimBill?.expenses || programme.budgetBreakdown?.expenses || [];

    const expenses = [
      ...activeExpenses,
      {
        category: "University Overhead (30%)",
        amount: programme.budgetBreakdown?.universityOverhead || 0,
      }
    ];
    
    // Calculate correct total expenditure
    const calculatedTotal = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    expenses.push({
      category: "Total Expenditure",
      amount: calculatedTotal,
    });
    
    const expBoxX = 50;
    const expBoxY = doc.y;
    const expColWidths = [350, 150];
    doc
      .rect(
        expBoxX,
        expBoxY,
        expColWidths[0] + expColWidths[1],
        rowHeight * expenses.length
      )
      .stroke();

    expenses.forEach((e, i) => {
      const y = expBoxY + i * rowHeight + 5;
      doc
        .font("Helvetica")
        .text(e.category, expBoxX + 10, y)
        .text(`Rs. ${e.amount.toFixed(2)}`, expBoxX + expColWidths[0] + 10, y);
    });

    doc.moveDown(3);
    doc
      .font("Helvetica")
      .text(
        "The above budget is tentative. This may vary depending on the number of participants attending the program.",
        { width: 500, align: 'left' }
      );
    doc.moveDown(3);
    
    // Use dynamic signature based on organizing departments - same format as claim PDF
    const budgetPrimaryAbbrev = getDeptAbbreviationLocal(primaryDept);
    const budgetAssociativeAbbrevs = associativeDepts.map(d => getDeptAbbreviationLocal(d));
    
    const signatureText = budgetAssociativeAbbrevs.length > 0
      ? `HOD\n${budgetPrimaryAbbrev} & ${budgetAssociativeAbbrevs.join(" & ")}`
      : `HOD\n${budgetPrimaryAbbrev}`;
    
    doc.text(signatureText, { align: "right" });

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Error generating PDF", error: error.message });
    }
  }
};

export const generateClaimBillPDF = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id);
    if (!programme || !programme.claimBill) {
      return res
        .status(404)
        .json({ message: "Programme or Claim Bill not found" });
    }

    // Get dynamic department information
    const primaryDept = programme.organizingDepartments?.primary || "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)";
    const associativeDepts = programme.organizingDepartments?.associative || [];
    
    // Helper function for department abbreviations
    const getDeptAbbreviation = (deptName) => {
      if (!deptName) return "UNKNOWN";
      if (deptName.includes("ELECTRICAL") && deptName.includes("ELECTRONICS")) return "EEE";
      if (deptName.includes("CYBER SECURITY")) return "CCS";
      if (deptName.includes("INFORMATION TECHNOLOGY")) return "IT";
      if (deptName.includes("ELECTRONICS") && deptName.includes("COMMUNICATION")) return "ECE";
      if (deptName.includes("MECHANICAL")) return "MECH";
      if (deptName.includes("CIVIL")) return "CIVIL";
      if (deptName.includes("COMPUTER SCIENCE")) return "DCSE";
      return deptName.replace(/[^A-Z]/g, '') || "DEPT";
    };
    
    // Create department header text
    let deptHeaderText = primaryDept;
    if (associativeDepts.length > 0) {
      deptHeaderText += ` & ${associativeDepts.join(" & ")}`;
    }
    
    // Create abbreviations for signatures
    const primaryAbbrev = getDeptAbbreviation(primaryDept);
    const associativeAbbrevs = associativeDepts.map(d => getDeptAbbreviation(d));

    const doc = new PDFDocument({ margin: 50 });

    // Collect PDF in buffer
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfData = Buffer.concat(buffers);

      // Store PDF in MongoDB
      programme.claimPDF = {
        data: pdfData,
        contentType: "application/pdf",
        fileName: `ClaimBill_${programme.title.replace(/\s+/g, "_")}.pdf`,
      };

      await programme.save();

      // Send PDF to browser
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${programme.claimPDF.fileName}"`
      );
      res.end(pdfData);
    });

    // PDF content generation
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("BUDGET", { align: "center" })
      .moveDown(1.5);

    // Co-ordinators
    programme.coordinators.forEach((coord) => {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Co-ordinator", { continued: true })
        .font("Helvetica")
        .text(`  Dr. ${coord.name}, ${coord.designation}, ${coord.department}`);
    });

    doc.moveDown(1.5);

    // Table Header
    doc.fontSize(12).font("Helvetica-Bold");
    
    doc
      .text("S.No", 60)
      .text("Head of the Expenditure", 120)
      .text("Amount (in rupees)", 400);
    
    doc.moveDown(0.5);
    
    // Check Y position before drawing line
    const lineY = doc.y;
    doc.moveTo(50, lineY).lineTo(550, lineY).stroke();

    const expenses = programme.claimBill.expenses || [];
    let total = 0;
    doc.font("Helvetica");
    expenses.forEach((exp, idx) => {
      const amt = Number(exp.amount);

      if (isNaN(amt)) {
        console.warn(`❌ Skipping invalid amount in expense[${idx}]:`, exp);
        return;
      }

      total += amt;

      doc.text(`${idx + 1}.`, 60); // Serial No.
      doc.text(exp.category || "N/A", 120); // Category
      doc.text(`₹ ${amt.toFixed(2)}`, 400); // Amount
      doc.moveDown(0.5);
    });

    // Total
    doc.moveDown(1).font("Helvetica-Bold");
    doc.text(`Total`, 120);
    doc.text(`₹ ${total.toFixed(2)}`, 400);

    doc.moveDown(2);
    
    // Dynamic signature based on organizing departments
    if (associativeAbbrevs.length > 0) {
      doc.text(`HOD of ${primaryAbbrev}`, { align: "left" });
      doc.text("&", { align: "left" });
      associativeAbbrevs.forEach(abbrev => {
        doc.text(`HOD of ${abbrev}`, { align: "left" });
      });
    } else {
      doc.text(`HOD of ${primaryAbbrev}`, { align: "left" });
    }

    // Page 2
    doc.addPage();
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(deptHeaderText.toUpperCase(), { align: "center" });

    doc.moveDown(1);
    
    // Dynamic Head of Account based on primary department
    const headOfAccount = associativeAbbrevs.length > 0 
      ? `${primaryAbbrev} & ${associativeAbbrevs.join(" & ")} – 2–23–23–47 – Administrative and General Expenses/`
      : `${primaryAbbrev} – 2–23–23–47 – Administrative and General Expenses/`;
    
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Head Of Account: ${headOfAccount}`);

    const categoryText = expenses.map((e) => e.category).join(", ");
    doc.font("Helvetica-Oblique").text(`66 – "${categoryText}"`);

    doc.moveDown(1);
    
    // Dynamic Proceeding No.
    const proceedingDepts = associativeAbbrevs.length > 0 
      ? `${primaryAbbrev}/${associativeAbbrevs.join("/")}`
      : primaryAbbrev;
    
    doc
      .font("Helvetica")
      .text(
        `Proceeding No.: AU/${proceedingDepts}/Training Programme/2025-26, Dated: ${new Date().toLocaleDateString(
          "en-IN"
        )}`
      );

    doc.moveDown(1.5);
    const eventTitle = programme.title;
    const venue = programme.venue;
    const dateFrom = new Date(programme.startDate).toLocaleDateString("en-IN");
    const dateTo = new Date(programme.endDate).toLocaleDateString("en-IN");

    doc
      .text("Certified that the expenditure is incurred paid towards ", {
        continued: true,
      })
      .font("Helvetica-Bold")
      .text(`"${categoryText}"`, { continued: true })
      .font("Helvetica")
      .text(
        ` in connection with conduct of ${programme.mode.toLowerCase()} training programme on “${eventTitle}” held on ${dateFrom} to ${dateTo} in the ${deptHeaderText}, ${venue}, CEG Campus Anna University, Chennai – 25.`
      );

    doc.moveDown(1);
    const safeTotal = isNaN(total) ? 0 : total;
    
    // Additional safety check
    const finalTotal = Number(safeTotal) || 0;

    const totalAmount = `${finalTotal.toFixed(2)}`;

    doc.text(
      `The bill is in order and may be passed for payment of Rs. ${totalAmount}/- (Rupees ${convertToWords(
        finalTotal
      )} Only).`
    );
    doc.text(`The bill amount has not been claimed previously.`);

    doc.moveDown(2);
    programme.coordinators.forEach((coord) => {
      doc.font("Helvetica-Bold").text(`Co-ordinator`);
      doc
        .font("Helvetica")
        .text(`Dr. ${coord.name}, ${coord.designation}, ${coord.department}`)
        .moveDown(1);
    });

    doc
      .font("Helvetica-Bold");
      
    // Dynamic signature based on organizing departments (second occurrence)
    if (associativeAbbrevs.length > 0) {
      doc.text(`HOD of ${primaryAbbrev}`, { align: "left" });
      doc.text("&", { align: "left" });
      associativeAbbrevs.forEach(abbrev => {
        doc.text(`HOD of ${abbrev}`, { align: "left" });
      });
    } else {
      doc.text(`HOD of ${primaryAbbrev}`, { align: "left" });
    }

    doc.moveDown(3);
    doc.text(
      "Bill passed for Rs. ____________\n\n(Rupees ____________________________________________________________ Only)",
    );

    doc.moveDown(2);
    
    // Dynamic HOD signature - using only abbreviations
    const directorTitle = associativeAbbrevs.length > 0
      ? `HOD\n${primaryAbbrev} & ${associativeAbbrevs.join(" & ")}`
      : `HOD\n${primaryAbbrev}`;
    
    doc.text(directorTitle, { align: "right" });

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Error generating Claim Bill PDF",
        error: error.message,
      });
    }
  }
};

export const getHod = async (req, res) => {
  try {
    const hod = await user
      .findOne({
        role: { $regex: "^HOD$", $options: "i" },
        department: { $regex: "^CSE$", $options: "i" },
      })
      .select("-password");

    res.status(200).send(hod);
  } catch (err) {
    res.status(500);
    throw new Error(err.message);
  }
};

function convertToWords(amount) {
  // Safety check for invalid numbers
  if (isNaN(amount) || amount === null || amount === undefined) {
    console.warn("convertToWords received invalid amount:", amount);
    amount = 0;
  }
  
  // Ensure it's a valid number
  const safeAmount = Number(amount) || 0;
  
  try {
    return toWords(safeAmount).replace(/\b\w/g, (l) => l.toUpperCase());
  } catch (error) {
    console.error("Error in convertToWords:", error, "amount:", safeAmount);
    return "Zero";
  }
}


