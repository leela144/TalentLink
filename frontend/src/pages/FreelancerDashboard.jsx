// src/pages/FreelancerDashboard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import axios from "axios";

export default function FreelancerDashboard() {
  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    activeJobs: 0,
    proposalsSent: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    completedProjects: 0,
    activeProjects: 0,
  });
  const [proposals, setProposals] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [missingItems, setMissingItems] = useState([]);
  const [activeTab, setActiveTab] = useState("projects");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ----------------- Helper Functions -----------------
  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return "green";
    if (percentage >= 50) return "yellow";
    return "red";
  };

  const getCompletionMessage = (percentage) => {
    if (percentage >= 80) return "Great job! Your profile is almost complete.";
    if (percentage >= 50) return "Halfway there! Complete more details.";
    return "Your profile is incomplete. Add missing information.";
  };

  const calculateProfileCompletion = (userData, profileData) => {
    let total = 0;
    const missing = [];

    if (userData?.first_name) total += 20;
    else missing.push("First Name");

    if (userData?.last_name) total += 20;
    else missing.push("Last Name");

    if (profileData?.skills?.length) total += 20;
    else missing.push("Skills");

    if (profileData?.hourly_rate) total += 20;
    else missing.push("Hourly Rate");

    if (profileData?.bio) total += 20;
    else missing.push("Bio");

    return { percentage: total, missingItems: missing };
  };

  // ----------------- API Calls -----------------
  const authAPI = {
    getFreelancerProfile: () => axios.get("/api/freelancer/profile"),
    getMyProposals: () => axios.get("/api/freelancer/proposals"),
    getMyContracts: () => axios.get("/api/freelancer/contracts"),
  };

  const jobApplicationsAPI = { list: () => axios.get("/api/job-applications") };

  const workspacesAPI = {
    list: () => axios.get("/api/workspaces"),
    getPayments: (id) => axios.get(`/api/workspaces/${id}/payments`),
  };

  // ----------------- Fetch Dashboard Data -----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user from localStorage
        const data = JSON.parse(localStorage.getItem("tl_user"));
        setUser(data?.user);

        // Fetch freelancer profile
        const profRes = await authAPI.getFreelancerProfile();
        const profData = profRes.data || {};


        // Profile completion
        const completion = calculateProfileCompletion(data?.user, profData);
        setProfileCompletion(completion.percentage);
        setMissingItems(completion.missingItems);

        // Fetch proposals
        const propRes = await authAPI.getMyProposals();
        const propData = Array.isArray(propRes.data) ? propRes.data : [];
        setProposals(propData);

        // Fetch job applications
        const jobRes = await jobApplicationsAPI.list();
        const jobApps = Array.isArray(jobRes.data) ? jobRes.data : [];
        setJobApplications(jobApps);

        // Fetch contracts
        const contrRes = await authAPI.getMyContracts();
        const contrData = Array.isArray(contrRes.data) ? contrRes.data : [];
        setContracts(contrData);

        // Fetch workspaces & earnings
        const wsRes = await workspacesAPI.list();
        const workspaces = Array.isArray(wsRes.data) ? wsRes.data : [];
        const paymentsPromises = workspaces.map(ws =>
          workspacesAPI.getPayments(ws.id).catch(() => ({ data: [] }))
        );
        const paymentsResults = await Promise.all(paymentsPromises);
        const allPayments = paymentsResults.flatMap(res => {
          const p = Array.isArray(res.data) ? res.data : [];
          return p.filter(pay => pay.freelancer_confirmed);
        });
        const totalEarnings = allPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        const pendingEarnings = workspaces
          .filter(ws => ws.contract_status === "active")
          .reduce((sum, ws) => sum + (ws.remaining_amount || 0), 0);
        const completedProjects = workspaces.filter(ws => ws.is_fully_completed).length;
        const activeProjects = workspaces.filter(ws => ws.contract_status === "active").length;

        setStats({
          activeJobs: contrData.filter(c => c.status === "active").length || 0,
          proposalsSent: propData.length + jobApps.length || 0,
          totalEarnings,
          pendingEarnings,
          completedProjects,
          activeProjects,
        });

      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeAndPendingContracts = contracts.filter(
    c => c.status === "active" || c.status === "pending"
  );

  const completionColor = getCompletionColor(profileCompletion);
  const completionMessage = getCompletionMessage(profileCompletion);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">
        Welcome {user?.first_name || "Freelancer"}!
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* Profile Completion */}
      {profileCompletion < 100 && (
        <div className={`mb-4 p-4 border rounded ${completionColor === "green" ? "bg-green-100 border-green-300" : completionColor === "yellow" ? "bg-yellow-100 border-yellow-300" : "bg-red-100 border-red-300"}`}>
          <p className="font-semibold mb-2">Profile {profileCompletion}% Complete</p>
          <p className="text-sm mb-2">{completionMessage}</p>
          <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
            <div className={`h-2 rounded-full ${completionColor === "green" ? "bg-green-500" : completionColor === "yellow" ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${profileCompletion}%` }}></div>
          </div>
          {missingItems.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs">
              {missingItems.map((item, i) => (
                <span key={i} className="px-2 py-1 bg-white border rounded">{item}</span>
              ))}
            </div>
          )}
          <Link to="/profile" className="text-purple-600 font-semibold text-sm mt-2 inline-block">Complete Profile →</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm font-medium">Total Earnings</p>
          <p className="text-lg font-bold">₹{stats.totalEarnings}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm font-medium">Pending Earnings</p>
          <p className="text-lg font-bold">₹{stats.pendingEarnings}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm font-medium">Active Projects</p>
          <p className="text-lg font-bold">{stats.activeProjects}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm font-medium">Completed Projects</p>
          <p className="text-lg font-bold">{stats.completedProjects}</p>
        </div>
      </div>

      {/* Proposals / Applications Tabs */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded shadow p-4">
          <div className="flex gap-2 mb-3">
            <button onClick={() => setActiveTab("projects")} className={`${activeTab === "projects" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"} px-3 py-1 rounded`}>Proposals ({proposals.length})</button>
            <button onClick={() => setActiveTab("jobs")} className={`${activeTab === "jobs" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"} px-3 py-1 rounded`}>Job Applications ({jobApplications.length})</button>
          </div>
          <div>
            {activeTab === "projects" ? (
              proposals.length > 0 ? proposals.slice(0, 5).map(p => (
                <div key={p.id} className="border p-2 rounded mb-2">
                  <p className="font-semibold">{p.project_title || "Untitled Project"}</p>
                  <p>₹{p.bid_amount}</p>
                  <p>Status: {p.status}</p>
                </div>
              )) : <p>No proposals yet</p>
            ) : (
              jobApplications.length > 0 ? jobApplications.slice(0, 5).map(a => (
                <div key={a.id} className="border p-2 rounded mb-2">
                  <p className="font-semibold">{a.job_title || "Untitled Job"}</p>
                  <p>₹{a.bid_amount}</p>
                  <p>Status: {a.status}</p>
                </div>
              )) : <p>No job applications yet</p>
            )}
          </div>
        </div>

        {/* Active / Pending Contracts */}
        <div className="bg-white rounded shadow p-4">
          <p className="font-semibold mb-2">Active & Pending Contracts</p>
          {activeAndPendingContracts.length > 0 ? activeAndPendingContracts.slice(0, 5).map(c => (
            <div key={c.id} className="border p-2 rounded mb-2">
              <p className="font-semibold">{c.project_title || c.job_title || `Contract #${c.id}`}</p>
              <p>Client: {c.client_name || "Unknown"}</p>
              <p>Status: {c.status}</p>
            </div>
          )) : <p>No active or pending contracts</p>}
        </div>
      </div>
    </div>
  );
}
