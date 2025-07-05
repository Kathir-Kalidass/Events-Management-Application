import { useState, useRef, useContext } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { SelectedEventContext } from "../dashboard";
import { getMonthName, getYear } from "./dateUtils";
import { getDate } from "./getDate";
import { getTargetAudience, getResourcePersons } from "./getUserDetails";

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

const ProposalLetter = ({ event, activePage, setActivePage }) => {
  const date = new Date();
  const { selectedEvent, setSelectedEvent } = useContext(SelectedEventContext);

  console.log(selectedEvent);

  function getHonarariumCharge() {
    let amount = 0;
    const expense = selectedEvent.budgetBreakdown.expenses;
    console.log(expense);

    for (let i = 0; i < expense.length; i++) {
      if (
        expense[i].category == "HONARARIUM" ||
        expense[i].category == "honararium"
      ) {
        amount = selectedEvent.budgetBreakdown.expenses[i].amount;
        break;
      }
    }
    console.log(`honararium ${amount}`);
    return amount;
  }

  function getRefreshmentCharge() {
    let amount = 0;
    const expense = selectedEvent.budgetBreakdown.expenses;
    console.log(expense);

    for (let i = 0; i < expense.length; i++) {
      if (
        expense[i].category == "REFRESHMENT" ||
        expense[i].category == "refreshment"
      ) {
        amount = selectedEvent.budgetBreakdown.expenses[i].amount;
        break;
      }
    }
    console.log(`refresh ${amount}`);
    return amount;
  }

  function getUniversityOverhead() {
    let amount = 0;
    const expense = selectedEvent.budgetBreakdown.expenses;
    console.log(expense);

    for (let i = 0; i < expense.length; i++) {
      if (
        expense[i].category == "UNIVERSITY OVERHEAD" ||
        expense[i].category == "university overhead"
      ) {
        amount = selectedEvent.budgetBreakdown.expenses[i].amount;
        break;
      }
    }
    console.log(`univ overhead ${amount}`);
    return amount;
  }

  const [loading, setLoading] = useState(false);

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
            Centre : DEPARTMENT OF CSE & CENTRE FOR CYBER SECURITY <br></br>
            Letter No.: Lr. No. 1/TrainingProgramme/CSE&CCS/{date.getFullYear()}{" "}
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
            <Box
              sx={{
                display: "inline-block",
                paddingLeft: "83px",
              }}
            >
              : {selectedEvent.mode}
            </Box>
          </Typography>
          <Typography
            sx={{
              fontFamily: "Times New Roman",
              maxWidth: "650px",
              textIndent: "40px",
            }}
          >
            • <b>Duration</b>{" "}
            <Box
              sx={{
                display: "inline-block",
                paddingLeft: "60px",
              }}
            >
              : {selectedEvent.duration}
            </Box>
          </Typography>
          <Typography
            sx={{
              fontFamily: "Times New Roman",
              maxWidth: "650px",
              textIndent: "40px",
            }}
          >
            • <b>Target Audience</b>
            <Box
              sx={{
                display: "inline-block",
                paddingLeft: "13px",
              }}
            >
              : {getTargetAudience(selectedEvent)}
            </Box>
          </Typography>
          <Typography
            sx={{
              fontFamily: "Times New Roman",
              maxWidth: "650px",
              textIndent: "40px",
            }}
          >
            • <b>Resource Persons</b>{" "}
            <Box
              sx={{
                display: "inline-block",
              }}
            >
              : {getResourcePersons(selectedEvent)}
            </Box>
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
              HoD, DCSE
            </b>
            <b
              sx={{
                fontFamily: "Times New Roman",
                maxWidth: "650px",
                fontSize: "18px",
              }}
            >
              Director, CCS
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
              alignItems: "center",
            }}
          >
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
            <b>CHAIRMAN</b>
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
                  <td rowSpan="4">
                    Registration fee
                    <br />
                    {selectedEvent.budgetBreakdown.income.map((item, index) => (
                      <ul
                        style={{
                          margin: "0px",
                        }}
                        key={index}
                      >
                        {`${item.expectedParticipants} x ${item.perParticipantAmount}`}
                      </ul>
                    ))}
                    <br />= {selectedEvent.budgetBreakdown.totalIncome}
                  </td>
                  <td>Honorarium</td>
                  <td>{getHonarariumCharge()}</td>
                </tr>
                <tr>
                  <td>Stationery and Refreshments</td>
                  <td>{getRefreshmentCharge()}</td>
                </tr>
                <tr>
                  <td>University Overhead</td>
                  <td>{selectedEvent.budgetBreakdown.universityOverhead}</td>
                </tr>
                <tr>
                  <td>GST</td>
                  <td>18 %</td>
                </tr>
                <tr>
                  <td>
                    <b>Total</b>
                  </td>
                  <td></td>
                  <td>
                    <b>{selectedEvent.budgetBreakdown.totalExpenditure}</b>
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
            HoD, DCSE & Director, CCS
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ProposalLetter;
