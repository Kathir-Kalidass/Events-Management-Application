import { eventState } from "../../../../../shared/context/eventProvider";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Box, Grid, Typography, Paper } from "@mui/material";

const COLORS = ["#00C49F", "#FF8042", "#0088FE"];

const getStatusData = (events) => {
  const count = { approved: 0, rejected: 0, pending: 0 };
  events.forEach((e) => count[e.status]++);
  return Object.keys(count).map((key, idx) => ({
    name: key,
    value: count[key],
    color: COLORS[idx],
  }));
};

const getMonthlyData = (events) => {
  const monthlyCounts = Array(12).fill(0);
  events.forEach((e) => {
    const date = new Date(e.createdAt);
    const month = date.getMonth();
    monthlyCounts[month]++;
  });
  return monthlyCounts.map((count, idx) => ({
    month: new Date(0, idx).toLocaleString("default", { month: "short" }),
    proposals: count,
  }));
};

const getTypeData = (events) => {
  const typeMap = {};
  events.forEach((e) => {
    typeMap[e.type] = (typeMap[e.type] || 0) + 1;
  });
  return Object.entries(typeMap).map(([type, count]) => ({ type, count }));
};

const DashboardCharts = () => {
  const { user, events, setEvents } = eventState();

  const [statusData, setStatusData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [typeData, setTypeData] = useState([]);

  useEffect(() => {
    if (events.length > 0) {
      setStatusData(getStatusData(events));
      setMonthlyData(getMonthlyData(events));
      setTypeData(getTypeData(events));
    }
  }, [events]);

  return (
    <Box 
    
    sx={{
      display:"grid",
      gridTemplateColumns:{
        lg:"1fr 1fr"
      },
      width:"100%",
      mb:3,
    }}>
      {/* Pie Chart */}
      <Box
        sx={{
          width:"450px"
        }}
      >
        <Paper elevation={3} sx={{
           p: 2,
           mr:10,
           }}>
          <Typography variant="h5" gutterBottom>
            Status Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                dataKey="value"
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Bar Chart */}
      <Box>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>
            Events by Type
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default DashboardCharts;
