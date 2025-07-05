import { useState, useRef, useContext, useEffect } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { SelectedEventContext } from "../dashboard";
import { getMonthName, getYear } from "./dateUtils";
import { getDate } from "./getDate";
import { getTargetAudience, getResourcePersons } from "./getUserDetails";
import { convenorCommitteeAPI } from "../../../services/api";

const styles = {
  standard: {
    fontFamily: "Times New Roman",
    maxWidth: "650px",
    fontSize: "18px",
  },
  bold: {
    fontWeight: "bold",
    fontFamily: "Times New Roman",
    fontSize: "18px",
  },
};

// Helper functions for dynamic department handling
const getDeptAbbreviation = (deptName) => {
  if (!deptName) return "DEPT";
  if (deptName.includes("ELECTRICAL") && deptName.includes("ELECTRONICS")) return "EEE";
  if (deptName.includes("CYBER SECURITY")) return "CCS";
  if (deptName.includes("INFORMATION TECHNOLOGY")) return "IT";
  if (deptName.includes("ELECTRONICS") && deptName.includes("COMMUNICATION")) return "ECE";
  if (deptName.includes("MECHANICAL")) return "MECH";
  if (deptName.includes("CIVIL")) return "CIVIL";
  if (deptName.includes("COMPUTER SCIENCE")) return "DCSE";
  return deptName.replace(/[^A-Z]/g, '') || "DEPT";
};

const getDeptFullName = (deptName) => {
  if (!deptName) return "UNKNOWN DEPARTMENT";
  if (deptName.includes("CYBER SECURITY")) return "Centre for Cyber Security (CCS)";
  if (deptName.includes("COMPUTER SCIENCE")) return "Department of Computer Science and Engineering (DCSE)";
  if (deptName.includes("ELECTRICAL") && deptName.includes("ELECTRONICS")) return "Department of Electrical and Electronics Engineering (EEE)";
  if (deptName.includes("INFORMATION TECHNOLOGY")) return "Department of Information Technology (IT)";
  if (deptName.includes("ELECTRONICS") && deptName.includes("COMMUNICATION")) return "Department of Electronics and Communication Engineering (ECE)";
  if (deptName.includes("MECHANICAL")) return "Department of Mechanical Engineering (MECH)";
  if (deptName.includes("CIVIL")) return "Department of Civil Engineering (CIVIL)";
  return deptName;
};

const getCentreHeaderText = (primary, associative) => {
  const primaryAbbrev = getDeptAbbreviation(primary);
  if (!associative || associative.length === 0) {
    return `DEPARTMENT OF ${primaryAbbrev}`;
  }
  const associativeAbbrevs = associative.map(d => getDeptAbbreviation(d));
  return `DEPARTMENT OF ${primaryAbbrev} & ${associativeAbbrevs.map(abbrev => 
    abbrev === 'CCS' ? 'CENTRE FOR CYBER SECURITY' : `DEPARTMENT OF ${abbrev}`
  ).join(' & ')}`;
};

const getLetterNoAbbrev = (primary, associative) => {
  const primaryAbbrev = getDeptAbbreviation(primary);
  if (!associative || associative.length === 0) {
    return primaryAbbrev;
  }
  const associativeAbbrevs = associative.map(d => getDeptAbbreviation(d));
  return `${primaryAbbrev}&${associativeAbbrevs.join('&')}`;
};

const getSubjectDepts = (primary, associative) => {
  const primaryAbbrev = getDeptAbbreviation(primary);
  if (!associative || associative.length === 0) {
    return primaryAbbrev;
  }
  const associativeAbbrevs = associative.map(d => getDeptAbbreviation(d));
  return `${primaryAbbrev} & ${associativeAbbrevs.join(" & ")}`;
};

const getParagraphDeptText = (primary, associative) => {
  const primaryFullName = getDeptFullName(primary);
  if (!associative || associative.length === 0) {
    return primaryFullName;
  }
  
  const associativeFullNames = associative.map(d => getDeptFullName(d));
  if (associativeFullNames.length === 1) {
    return `${primaryFullName} and the ${associativeFullNames[0]}`;
  } else {
    const lastDept = associativeFullNames.pop();
    return `${primaryFullName}, ${associativeFullNames.join(", ")} and the ${lastDept}`;
  }
};

const ProposalLetter = ({ event, activePage, setActivePage }) => {
  const date = new Date();
  const { selectedEvent, setSelectedEvent } = useContext(SelectedEventContext);
  const [convenorCommitteeMembers, setConvenorCommitteeMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  console.log(selectedEvent);
  console.log('Current convenorCommitteeMembers:', convenorCommitteeMembers);

  // Fetch convenor committee members on component mount
  useEffect(() => {
    const fetchConvenorCommitteeMembers = async () => {
      try {
        const response = await convenorCommitteeAPI.getAll();
        console.log('API Response:', response);
        
        // Extract the data array from the response - backend returns {success: true, data: [...]}
        const members = response.data || response;
        console.log('Fetched convenor committee members:', members);
        
        if (Array.isArray(members) && members.length > 0) {
          setConvenorCommitteeMembers(members);
        } else {
          console.warn('No convenor committee members found in API response, using fallback');
          // Use fallback only if no data received
          setConvenorCommitteeMembers([
            {
              name: "Dr. S. Usa",
              designation: "Professor and Chairperson",
              department: "Faculty of Electrical Engg., Anna University, Chennai - 25.",
              role: "Member"
            },
            {
              name: "Commissioner of Technical Education",
              designation: "Directorate of Technical Education",
              department: "Government of Tamil Nadu.",
              role: "Member"
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching convenor committee members:', error);
        // Set default members if API fails
        setConvenorCommitteeMembers([
          {
            name: "Dr. S. Usa",
            designation: "Professor and Chairperson",
            department: "Faculty of Electrical Engg., Anna University, Chennai - 25.",
            role: "Member"
          },
          {
            name: "Commissioner of Technical Education",
            designation: "Directorate of Technical Education",
            department: "Government of Tamil Nadu.",
            role: "Member"
          }
        ]);
      }
    };

    fetchConvenorCommitteeMembers();
  }, []);

  // Enhanced budget calculation functions - prioritize claim bill data
  function getActiveExpenses() {
    // Use claim bill expenses if available, otherwise use budget breakdown
    return selectedEvent.claimBill?.expenses || selectedEvent.budgetBreakdown?.expenses || [];
  }

  function getHonarariumCharge() {
    let amount = 0;
    const expense = getActiveExpenses();
    console.log('📊 Calculating honorarium from expenses:', expense);

    for (let i = 0; i < expense.length; i++) {
      const category = expense[i].category.toLowerCase();
      if (category.includes("honorarium") || category.includes("honararium") || 
          category.includes("resource person") || category.includes("speaker")) {
        amount += parseFloat(expense[i].amount) || 0;
      }
    }
    console.log(`💰 Total honorarium: ${amount}`);
    return amount;
  }

  function getRefreshmentCharge() {
    let amount = 0;
    const expense = getActiveExpenses();
    console.log('📊 Calculating refreshments from expenses:', expense);

    for (let i = 0; i < expense.length; i++) {
      const category = expense[i].category.toLowerCase();
      if (category.includes("refreshment") || category.includes("stationery") || 
          category.includes("materials") || category.includes("catering")) {
        amount += parseFloat(expense[i].amount) || 0;
      }
    }
    console.log(`🍿 Total refreshment/stationery: ${amount}`);
    return amount;
  }

  function getUniversityOverhead() {
    return parseFloat(selectedEvent.budgetBreakdown.universityOverhead) || 0;
  }

  // Calculate GST amount based on income
  function calculateGSTAmount() {
    let totalGST = 0;
    selectedEvent.budgetBreakdown.income.forEach(item => {
      const expectedParticipants = parseFloat(item.expectedParticipants) || 0;
      const perParticipantAmount = parseFloat(item.perParticipantAmount) || 0;
      const gstPercentage = parseFloat(item.gstPercentage) || 0;
      
      // Calculate total income for this category
      const totalIncome = expectedParticipants * perParticipantAmount;
      
      // Calculate GST on this income
      const gstAmount = (totalIncome * gstPercentage) / 100;
      totalGST += gstAmount;
    });
    return Math.round(totalGST);
  }

  // Calculate total expenditure dynamically - prioritize claim bill data
  function calculateTotalExpenditure() {
    console.log('📊 Calculating total expenditure...');
    console.log('Claim bill data:', selectedEvent.claimBill);
    console.log('Budget breakdown data:', selectedEvent.budgetBreakdown);
    
    // If claim bill exists, calculate total from claim expenses + university overhead
    if (selectedEvent.claimBill?.expenses) {
      let claimExpensesTotal = 0;
      selectedEvent.claimBill.expenses.forEach(expense => {
        claimExpensesTotal += parseFloat(expense.amount) || 0;
      });
      const universityOverhead = parseFloat(selectedEvent.budgetBreakdown?.universityOverhead) || 0;
      const total = claimExpensesTotal + universityOverhead;
      console.log(`💰 Using claim expenses (${claimExpensesTotal}) + overhead (${universityOverhead}) = ${total}`);
      return total;
    }
    
    // Fallback: use budget breakdown total if available
    if (selectedEvent.budgetBreakdown?.totalExpenditure) {
      const budgetTotal = parseFloat(selectedEvent.budgetBreakdown.totalExpenditure) || 0;
      console.log(`💰 Using budget breakdown total: ${budgetTotal}`);
      return budgetTotal;
    }
    
    // Last resort: calculate from budget breakdown expenses + university overhead
    let totalExpenses = 0;
    (selectedEvent.budgetBreakdown?.expenses || []).forEach(expense => {
      totalExpenses += parseFloat(expense.amount) || 0;
    });
    
    const universityOverhead = parseFloat(selectedEvent.budgetBreakdown?.universityOverhead) || 0;
    const total = totalExpenses + universityOverhead;
    console.log(`💰 Calculated from budget expenses (${totalExpenses}) + overhead (${universityOverhead}) = ${total}`);
    return total;
  }

  const pdfRef = useRef();
  const generatePDF = async () => {
    setLoading(true); // Start loading

    setTimeout(async () => {
      const input = pdfRef.current;

      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Additional pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`ProposalLetter-${selectedEvent._id}`);

      setLoading(false); // Stop loading after PDF is generated
    }, 100); // Allow UI to re-render before heavy processing starts
  };

  function handleBackToProposalPage() {
    setActivePage("proposal");
  }

  return (
    <Box>
      <IconButton
        onClick={handleBackToProposalPage}
        sx={{
          m: 1,
        }}
      >
        <ArrowBackIcon></ArrowBackIcon>
      </IconButton>

      <Button loading={loading} variant="contained" onClick={generatePDF}>
        Download PDF
      </Button>

      <Box>
        <Box
          ref={pdfRef}
          style={{
            width: "794px",
            padding: "20px",
            background: "#fff",
            color: "#000",
            margin: "0 auto",
            paddingTop: "100px",
            fontFamily: "Times New Roman",
          }}
          sx={{
            mt: 6,
            "& .MuiTypography-root": {
              fontSize: "18px",
            },
          }}
        >
          <Typography
            sx={{
              fontWeight: "bold",
              fontFamily: "Times New Roman",
            }}
          >
            Centre : {getCentreHeaderText(
              selectedEvent?.organizingDepartments?.primary || "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)",
              selectedEvent?.organizingDepartments?.associative || []
            )} <br></br>
            Letter No.: Lr. No. 1/TrainingProgramme/{getLetterNoAbbrev(
              selectedEvent?.organizingDepartments?.primary || "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)",
              selectedEvent?.organizingDepartments?.associative || []
            )}/{date.getFullYear()}{" "}
            <br></br>
            Date: {date.toLocaleDateString()}
          </Typography>
          <br></br>
          <br></br>

          <Typography
            sx={{
              fontWeight: "600",
              fontFamily: "Times New Roman",
            }}
          >
            NOTE SUBMITTED TO THE CONVENOR COMMITTEE:
          </Typography>

          <Typography
            sx={{
              fontFamily: "Times New Roman",
              maxWidth: "650px",
            }}
          >
            Sub: DCSE & CCS – Request for <b>Permission and Approval</b> to
            conduct a <b>Two-Day Online Training Programme</b> on “
            <span>{selectedEvent.title}</span>” - reg.,
          </Typography>

          <Typography
            sx={{
              pl: 26,
            }}
          >
            ******
          </Typography>
          <br></br>
          <Typography
            sx={{
              fontFamily: "Times New Roman",
              maxWidth: "650px",
            }}
          >
            The Department of Computer Science and Engineering (DCSE) and the
            Centre for Cyber Security (CCS) seek kind permission and approval to
            organize a Two-Day Online Training Programme titled “
            <b>{selectedEvent.title}</b>” in the month of{" "}
            {getMonthName(selectedEvent.startDate)},{" "}
            {getYear(selectedEvent.startDate)} [Tentative Dates:{" "}
            {getDate(selectedEvent.startDate)} and{" "}
            {getDate(selectedEvent.endDate)}] with{" "}
            {selectedEvent.createdBy.name} as coordinators.
          </Typography>
          <br></br>
          <Typography
            sx={{
              fontFamily: "Times New Roman",
              maxWidth: "650px",
            }}
          >
            <b>Objective:</b>
            {selectedEvent.objectives}
          </Typography>
          <br></br>
          <br></br>

          <Typography
            sx={{
              fontFamily: "Times New Roman",
              maxWidth: "650px",
            }}
          >
            The Training Programme Details are as follows:
          </Typography>

          <Typography
            sx={{
              fontFamily: "Times New Roman",
              maxWidth: "650px",
              textIndent: "40px",
            }}
          >
            • <b>Mode</b>{" "}
            <span
              style={{
                display: "inline-block",
                paddingLeft: "83px",
              }}
            >
              : {selectedEvent.mode}
            </span>
          </Typography>
          <Typography
            sx={{
              fontFamily: "Times New Roman",
              maxWidth: "650px",
              textIndent: "40px",
            }}
          >
            • <b>Duration</b>{" "}
            <span
              style={{
                display: "inline-block",
                paddingLeft: "60px",
              }}
            >
              : {selectedEvent.duration}
            </span>
          </Typography>
          <Typography
            sx={{
              fontFamily: "Times New Roman",
              maxWidth: "650px",
              textIndent: "40px",
            }}
          >
            • <b>Target Audience</b>
            <span
              style={{
                display: "inline-block",
                paddingLeft: "13px",
              }}
            >
              : {getTargetAudience(selectedEvent)}
            </span>
          </Typography>
          <Typography
            sx={{
              fontFamily: "Times New Roman",
              maxWidth: "650px",
              textIndent: "40px",
            }}
          >
            • <b>Resource Persons</b>{" "}
            <span
              style={{
                display: "inline-block",
              }}
            >
              : {getResourcePersons(selectedEvent)}
            </span>
          </Typography>
          <br></br>
          <br></br>
          <Typography
            sx={{
              fontFamily: "Times New Roman",
              maxWidth: "650px",
            }}
          >
            It is requested that permission may be granted to conduct the
            training programme and to host the details in the Anna University
            website. It is also requested that permission may be granted to
            collect registration fee from the participants as detailed in the
            table below. The tentative budget for the training programme is
            given in the annexure attached.
          </Typography>
          <br></br>
          <br></br>

          <table
            border="1px"
            style={{
              width: "630px",
              textAlign: "left",
              borderCollapse: "collapse",
            }}
          >
            <colgroup>
              <col style={{ width: "10%" }} />
              <col style={{ width: "50%" }} />
              <col style={{ width: "40%" }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ padding: "4px" }}>Sl. No.</th>
                <th>Category </th>
                <th>Registration Fee </th>
              </tr>
            </thead>
            <tbody>
              {selectedEvent.budgetBreakdown.income.map((item, index) => (
                <tr key={index}>
                  <td style={{ padding: "4px" }}>{index + 1}.</td>
                  <td style={{ padding: "4px" }}>{item.category}</td>
                  <td style={{ padding: "4px" }}>
                    Rs.{item.perParticipantAmount}/- + {item.gstPercentage}%GST
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <br></br>
          <br></br>
          <br></br>

          <Typography
            sx={{
              fontFamily: "Times New Roman",
              maxWidth: "650px",
            }}
          >
            Hence, it is kindly requested that permission may be given to
            conduct the training programme and the registration fees may be
            collected in the form of Demand Draft / Online payment favouring
            "The Director, CSRC, Anna University, Chennai".
          </Typography>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>

          <Box
            sx={{
              fontFamily: "Times New Roman",
              display: "flex",
              justifyContent: "space-around",
              width: "800px",
            }}
          >
            <b
              sx={{
                fontFamily: "Times New Roman",
                maxWidth: "650px",
                fontSize: "18px",
              }}
            >
              Co-ordinator(s)
            </b>
            <b
              sx={{
                fontFamily: "Times New Roman",
                maxWidth: "650px",
                fontSize: "18px",
              }}
            >
              HOD of {getDeptAbbreviation(selectedEvent?.organizingDepartments?.primary || "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)")}
            </b>
            <b
              sx={{
                fontFamily: "Times New Roman",
                maxWidth: "650px",
                fontSize: "18px",
              }}
            >
              {selectedEvent?.organizingDepartments?.associative?.length > 0 && 
                selectedEvent.organizingDepartments.associative.map((dept, index) => (
                  `${index > 0 ? ', ' : ''}Director, ${getDeptAbbreviation(dept)}`
                )).join('')
              }
            </b>
            <b
              sx={{
                fontFamily: "Times New Roman",
                maxWidth: "650px",
                fontSize: "18px",
              }}
            >
              Director, CSRC
            </b>
            <b
              sx={{
                fontFamily: "Times New Roman",
                maxWidth: "650px",
                fontSize: "18px",
              }}
            >
              REGISTRAR
            </b>
          </Box>
          <Box
            sx={{
              mt: "4px",
            }}
          >
            {selectedEvent.coordinators.map((item, index) => (
              <ul
                key={index}
                style={{
                  margin: "0px",
                  paddingLeft: "10px",
                }}
              >
                {item.name}
              </ul>
            ))}
          </Box>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 2
            }}
          >
            {convenorCommitteeMembers.length > 0 ? (
              convenorCommitteeMembers
                .filter(member => member.role !== 'Chairman') // Exclude Chairman as they appear at the end
                .sort((a, b) => {
                  // Sort by role priority: Secretary first, then Member
                  const roleOrder = { 'Secretary': 1, 'Member': 2 };
                  return (roleOrder[a.role] || 3) - (roleOrder[b.role] || 3);
                })
                .slice(0, 4) // Limit to 4 members to fit the layout
                .map((member, index) => (
                  <Box key={member._id || index} sx={{ minWidth: "200px", textAlign: "center" }}>
                    <Typography sx={styles.standard}>{member.name}</Typography>
                    <Typography sx={styles.standard}>
                      {member.designation}
                    </Typography>
                    {member.department && (
                      <Typography sx={styles.standard}>
                        {member.department}
                      </Typography>
                    )}
                    {member.address && (
                      <Typography sx={styles.standard}>
                        {member.address}
                      </Typography>
                    )}
                    <b style={styles.bold}>({member.role})</b>
                  </Box>
                ))
            ) : (
              // Fallback to hardcoded members if no dynamic data available
              <>
                <Box>
                  <Typography sx={styles.standard}>Dr. S. Usa </Typography>
                  <Typography sx={styles.standard}>
                    Professor and Chairperson
                  </Typography>
                  <Typography sx={styles.standard}>
                    Faculty of Electrical Engg.,
                  </Typography>
                  <Typography sx={styles.standard}>
                    Anna University, Chennai - 25.
                  </Typography>
                  <b style={styles.bold}>(Member)</b>
                </Box>
                <Box>
                  <Typography sx={styles.standard}>
                    Commissioner of Technical Education
                  </Typography>
                  <Typography sx={styles.standard}>
                    {" "}
                    Directorate of Technical Education,
                  </Typography>
                  <Typography sx={styles.standard}>
                    {" "}
                    Government of Tamil Nadu.
                  </Typography>
                  <b style={styles.bold}>(Member)</b>
                </Box>
              </>
            )}
          </Box>

          <Typography
            sx={{
              fontFamily: "Times New Roman",
              fontSize: "18px",
              textAlign: "center",
              pt: 12,
              mt: 10,
            }}
          >
            <b>APPROVED / NOT APPROVED</b>
          </Typography>

          <Typography
            sx={{
              fontFamily: "Times New Roman",
              fontSize: "18px",
              textAlign: "center",
              pt: 16,
              mt: 10,
            }}
          >
            {(() => {
              // Find Chairman from fetched convenor committee members
              const chairman = convenorCommitteeMembers.find(member => member.role === 'Chairman');
              if (chairman) {
                return (
                  <>
                    <div>{chairman.name}</div>
                    <div>{chairman.designation}</div>
                    {chairman.department && <div>{chairman.department}</div>}
                    {chairman.address && <div>{chairman.address}</div>}
                    <div><b>CHAIRMAN</b></div>
                  </>
                );
              } else {
                return <b>CHAIRMAN</b>;
              }
            })()}
          </Typography>

          <Typography
            sx={{
              fontFamily: "Times New Roman",
              fontSize: "18px",
              textAlign: "center",
            }}
          >
            <b>Convenor Committee, Anna University</b>
          </Typography>

          <Box
            sx={{
              mt: 45,
            }}
          >
            <Typography sx={styles.bold} textAlign="center">
              <b>TENTATIVE BUDGET</b>
            </Typography>

            <table
              border="1"
              cellSpacing="0"
              cellPadding="8"
              style={{
                borderCollapse: "collapse",
                textAlign: "left",
                width: "100%",
              }}
            >
              <thead>
                <tr>
                  <th>
                    <b>Income</b>
                  </th>
                  <th>
                    <b>Expenditure</b>
                  </th>
                  <th>
                    <b>Amount (Rs.)</b>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td rowSpan={
                    getActiveExpenses().length + 
                    (selectedEvent.budgetBreakdown?.universityOverhead ? 3 : 2) // +1 for GST, +1 for Total, +1 for overhead if exists
                  }>
                    Registration fee
                    <br />
                    {selectedEvent.budgetBreakdown?.income?.map((item, index) => (
                      <ul
                        style={{
                          margin: "0px",
                        }}
                        key={index}
                      >
                        {`${item.expectedParticipants} x ${item.perParticipantAmount}`}
                      </ul>
                    ))}
                    <br />= ₹{selectedEvent.budgetBreakdown?.totalIncome || 0}
                  </td>
                  {/* Show all active expenses (claim bill or budget breakdown) */}
                  {getActiveExpenses().length > 0 ? (
                    <>
                      <td>{getActiveExpenses()[0].category}</td>
                      <td>₹{getActiveExpenses()[0].amount}</td>
                    </>
                  ) : (
                    <>
                      <td>No expenses</td>
                      <td>₹0</td>
                    </>
                  )}
                </tr>
                {/* Render remaining expenses */}
                {getActiveExpenses().slice(1).map((expense, index) => (
                  <tr key={`expense-${index}`}>
                    <td>{expense.category}</td>
                    <td>₹{expense.amount}</td>
                  </tr>
                ))}
                {/* Add University Overhead if it exists */}
                {selectedEvent.budgetBreakdown?.universityOverhead && (
                  <tr>
                    <td>University Overhead (30%)</td>
                    <td>₹{selectedEvent.budgetBreakdown.universityOverhead}</td>
                  </tr>
                )}
                <tr>
                  <td>GST (Combined)</td>
                  <td>₹{calculateGSTAmount()}</td>
                </tr>
                <tr>
                  <td>
                    <b>Total</b>
                  </td>
                  <td></td>
                  <td>
                    <b>₹{calculateTotalExpenditure()}</b>
                  </td>
                </tr>
              </tbody>
            </table>
          </Box>

          <Typography sx={styles.standard} marginTop="26px">
            The above budget is tentative. This may vary depending on the number
            of participants attending the program.
          </Typography>

          <Typography sx={styles.bold} textAlign="center" marginTop="60px">
            {(() => {
              const primary = selectedEvent?.organizingDepartments?.primary || "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)";
              const associative = selectedEvent?.organizingDepartments?.associative || [];
              const primaryAbbrev = getDeptAbbreviation(primary);
              
              if (associative.length === 0) {
                return `HOD of ${primaryAbbrev}`;
              }
              
              const associativeAbbrevs = associative.map(d => getDeptAbbreviation(d));
              return `HOD of ${primaryAbbrev} & ${associativeAbbrevs.map(abbrev => `HOD of ${abbrev}`).join(' & ')}`;
            })()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ProposalLetter;
