/* eslint-disable */
/* eslint-disable */
import { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Leaf,

  Users,
  Car,
  Tv,
  Zap,
  CheckCircle2,
  UploadCloud,
  AlertTriangle,
  TrendingDown,
  Award,
  Lock,
  Plus,
  Check,
  Loader2,
  Sparkles,
  Trash2,
  FileText,
  UserPlus
} from 'lucide-react';
import ChatBotWidget from './ChatBotWidget';
import { calculateLcaFootprint } from './carbonEngine';

// Carbon Emission Factors
const TRANSPORT_FACTORS = {
  petrolCar: 0.18, // kg CO2 / km
  dieselCar: 0.20, // kg CO2 / km
  twoWheeler: 0.05, // kg CO2 / km
  publicMetro: 0.02, // kg CO2 / km
};

const APPLIANCE_WATTS = {
  laptop: 60,
  airConditioner: 1800,
  smartphoneCharger: 10,
};

const GRID_FACTOR = 0.75; // kg CO2 / kWh (Indian Grid Average)

const LCA_PRODUCTS = [
  {
    id: 'laptop',
    name: 'Laptop',
    icon: '💻',
    mfgDebt: 280, // kg CO2
    lifespan: 1460, // days
    wattage: 60,
    unit: 'days',
    defaultUsage: 5, // days owned
    defaultUseHours: 8, // hours/day
    desc: 'High-performance computing device. Over 80% of its carbon footprint is created during silicon fabrication and assembly.'
  },
  {
    id: 'hairdryer',
    name: 'Hair Dryer',
    icon: '💇',
    mfgDebt: 10, // kg CO2
    lifespan: 1200, // uses (each use ~15 mins)
    wattage: 1500,
    unit: 'minutes',
    defaultUsage: 15, // minutes of session
    desc: 'Heating appliances draw heavy electrical power during operation, meaning the use-phase quickly catches up to manufacturing.'
  },
  {
    id: 'smartphone',
    name: 'Smartphone',
    icon: '📱',
    mfgDebt: 70, // kg CO2
    lifespan: 1095, // days
    wattage: 10,
    unit: 'days',
    defaultUsage: 3, // days owned
    defaultUseHours: 4, // hours/day
    desc: 'Pocket-sized computers require energy-dense rare minerals, contributing to high initial manufacturing debt compared to size.'
  }
];

// Initial Family Members Mock Data
const INITIAL_MEMBERS = [
  {
    id: 'priya',
    name: 'Priya',
    avatar: '👩‍⚕️',
    color: 'emerald', // emerald-500
    colorHex: '#10B981',
    consecutiveZeroDays: 0,
    dailyLog: {
      transport: { petrolCar: 10, dieselCar: 0, twoWheeler: 15, publicMetro: 20 },
      appliances: [
        { id: 'laptop', name: 'Laptop', wattage: 60, hours: 6, isDefault: true },
        { id: 'airConditioner', name: 'Air Conditioner', wattage: 1800, hours: 2, isDefault: true },
        { id: 'smartphoneCharger', name: 'Smartphone Charger', wattage: 10, hours: 8, isDefault: true }
      ]
    },
    history: {
      daily: [
        { day: 'Mon', value: 4.8 },
        { day: 'Tue', value: 5.2 },
        { day: 'Wed', value: 4.1 },
        { day: 'Thu', value: 3.9 },
        { day: 'Fri', value: 4.5 },
        { day: 'Sat', value: 3.2 },
        { day: 'Sun', value: 2.8 }
      ],
      weekly: [28.4, 26.2, 29.5, 28.5],
      monthly: { current: 112, previous: 125 }
    }
  },
  {
    id: 'amit',
    name: 'Amit',
    avatar: '👨‍💻',
    color: 'blue', // blue-500
    colorHex: '#3B82F6',
    consecutiveZeroDays: 0,
    dailyLog: {
      transport: { petrolCar: 25, dieselCar: 10, twoWheeler: 0, publicMetro: 0 },
      appliances: [
        { id: 'laptop', name: 'Laptop', wattage: 60, hours: 10, isDefault: true },
        { id: 'airConditioner', name: 'Air Conditioner', wattage: 1800, hours: 6, isDefault: true },
        { id: 'smartphoneCharger', name: 'Smartphone Charger', wattage: 10, hours: 4, isDefault: true }
      ]
    },
    history: {
      daily: [
        { day: 'Mon', value: 12.4 },
        { day: 'Tue', value: 11.8 },
        { day: 'Wed', value: 13.2 },
        { day: 'Thu', value: 10.9 },
        { day: 'Fri', value: 12.8 },
        { day: 'Sat', value: 9.5 },
        { day: 'Sun', value: 8.2 }
      ],
      weekly: [75.6, 72.0, 78.4, 78.8],
      monthly: { current: 312, previous: 345 }
    }
  },
  {
    id: 'rahul',
    name: 'Rahul',
    avatar: '👦',
    color: 'amber', // amber-500
    colorHex: '#F59E0B',
    consecutiveZeroDays: 3, // Immediately triggers the warning banner for testing
    dailyLog: {
      transport: { petrolCar: 0, dieselCar: 0, twoWheeler: 0, publicMetro: 0 },
      appliances: [
        { id: 'laptop', name: 'Laptop', wattage: 60, hours: 0, isDefault: true },
        { id: 'airConditioner', name: 'Air Conditioner', wattage: 1800, hours: 0, isDefault: true },
        { id: 'smartphoneCharger', name: 'Smartphone Charger', wattage: 10, hours: 0, isDefault: true }
      ]
    },
    history: {
      daily: [
        { day: 'Mon', value: 0 },
        { day: 'Tue', value: 0 },
        { day: 'Wed', value: 0 },
        { day: 'Thu', value: 0 },
        { day: 'Fri', value: 0 },
        { day: 'Sat', value: 0 },
        { day: 'Sun', value: 0 }
      ],
      weekly: [0, 0, 0, 0],
      monthly: { current: 0, previous: 0 }
    }
  }
];

const REWARDS_DATA = [
  {
    id: 'tata-cashback',
    title: 'Rs. 500 Electricity Cashback',
    sponsor: 'Tata Power Ltd.',
    description: 'Verify your carbon offset by showing a decrease in monthly grid usage.',
    cost: 0,
    requiresVerification: true,
    code: 'TATA-SAVE-995X'
  },
  {
    id: 'ecowear-discount',
    title: '30% Off Sustainable Brands',
    sponsor: 'EcoWear Apparel',
    description: 'Redeem coupon for eco-friendly apparel manufactured with recycled plastics.',
    cost: 400,
    requiresVerification: false,
    code: 'ECOWEAR30'
  },
  {
    id: 'organic-harvest',
    title: 'Rs. 250 Groceries Voucher',
    sponsor: 'OrganicHarvest Farms',
    description: 'Get discount on pesticide-free organic fresh produce delivered home.',
    cost: 300,
    requiresVerification: false,
    code: 'ORGANIC250'
  }
];

function App() {
  const [viewState, setViewState] = useState('landing'); // landing | dashboard

  // Navigation
  const [activeTab, setActiveTab] = useState('tracker'); // tracker | lca | dashboard

  // Global State
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [activeMemberId, setActiveMemberId] = useState('priya');
  const [householdPoints, setHouseholdPoints] = useState(2850);
  const [monthlyMilestoneClaimed, setMonthlyMilestoneClaimed] = useState(false);
  const [unlockedVouchers, setUnlockedVouchers] = useState({}); // { id: code }
  const [toasts, setToasts] = useState([]);

  // Daily Tracker Form State (local inputs for active member)
  const [trackerSubTab, setTrackerSubTab] = useState('transport'); // transport | appliances
  const [transportInputs, setTransportInputs] = useState({
    petrolCar: 0,
    dieselCar: 0,
    twoWheeler: 0,
    publicMetro: 0
  });
  const [applianceInputs, setApplianceInputs] = useState([
    { id: 'laptop', name: 'Laptop', wattage: 60, hours: 0, isDefault: true },
    { id: 'airConditioner', name: 'Air Conditioner', wattage: 1800, hours: 0, isDefault: true },
    { id: 'smartphoneCharger', name: 'Smartphone Charger', wattage: 10, hours: 0, isDefault: true }
  ]);
  const [customAppName, setCustomAppName] = useState('');
  const [customAppWatts, setCustomAppWatts] = useState('');
  const [customAppHours, setCustomAppHours] = useState(1.5);

  // LCA Deep-Dive State
  const [selectedLcaProduct, setSelectedLcaProduct] = useState(LCA_PRODUCTS[1]); // Hair dryer default
  const [lcaUsage, setLcaUsage] = useState(15); // 15 mins default
  const [lcaUseHours, setLcaUseHours] = useState(8); // 8 hours/day default for laptop/phone

  // Dashboard Period state
  const [dashboardPeriod, setDashboardPeriod] = useState('daily'); // daily | weekly | monthly

  // New Member Form State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAvatar, setNewMemberAvatar] = useState('👩');
  const [newMemberColor, setNewMemberColor] = useState('emerald');

  // Verification Modal State
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMemberId, setVerificationMemberId] = useState('priya');
  const [verificationStep, setVerificationStep] = useState(0); // 0: idle, 1: scanning, 2: account, 3: layout, 4: baseline, 5: success
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Milestone Celebration Overlay State
  const [showMilestoneOverlay, setShowMilestoneOverlay] = useState(false);

  // Synchronize inputs when active member changes
  useEffect(() => {
    const member = members.find(m => m.id === activeMemberId);
    if (member) {
      setTransportInputs(member.dailyLog.transport);
      setApplianceInputs(member.dailyLog.appliances);
    }
  }, [activeMemberId, members]);

  // Handle toast warnings and messages
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Calculations for Tracker
  // Optimized Calculations utilizing Life Cycle Assessment (LCA) Engine
  const liveTotalImpact = useMemo(() => {
    const formattedInput = {
      energy: {
        electricity: Array.isArray(applianceInputs)
          ? applianceInputs.reduce((sum, app) => sum + ((app.wattage * app.hours) / 1000), 0)
          : 0
      },
      transport: {
        petrolCarKm: transportInputs?.petrolCar || 0,
        dieselCarKm: transportInputs?.dieselCar || 0,
        twowheelerKm: transportInputs?.twowheeler || 0,
        publicTransitKm: transportInputs?.publicMetro || 0
      }
    };

    // Constant-time execution path via engine
    const results = calculateLcaFootprint(formattedInput);
    return results.total;
  }, [transportInputs, applianceInputs]);
  // Save Daily Log Action
  const handleSaveDailyLog = () => {
    const totalImpactVal = Number(liveTotalImpact.toFixed(2));

    setMembers((prevMembers) =>
      prevMembers.map((m) => {
        if (m.id === activeMemberId) {
          // Calculate consecutive zero days
          let newZeroDays = m.consecutiveZeroDays;
          if (totalImpactVal === 0) {
            newZeroDays += 1;
          } else {
            newZeroDays = 0;
          }

          // Update historical daily value (replace today's value which is index 6/Sunday or the last item in daily logs)
          const updatedDaily = [...m.history.daily];
          if (updatedDaily.length > 0) {
            updatedDaily[updatedDaily.length - 1] = {
              ...updatedDaily[updatedDaily.length - 1],
              value: totalImpactVal
            };
          }

          // Recalculate monthly current based on logs and weekly sum
          const newWeeklySum = updatedDaily.reduce((acc, curr) => acc + curr.value, 0);
          const updatedWeekly = [...m.history.weekly];
          if (updatedWeekly.length > 0) {
            updatedWeekly[updatedWeekly.length - 1] = Number(newWeeklySum.toFixed(1));
          }

          const currentMonthEmissions = Number((newWeeklySum * 4).toFixed(1)); // estimate month

          return {
            ...m,
            consecutiveZeroDays: newZeroDays,
            dailyLog: {
              transport: { ...transportInputs },
              appliances: [...applianceInputs]
            },
            history: {
              ...m.history,
              daily: updatedDaily,
              weekly: updatedWeekly,
              monthly: {
                ...m.history.monthly,
                current: currentMonthEmissions
              }
            }
          };
        }
        return m;
      })
    );

    // Points awarding
    let pointsAwarded = 50;
    if (totalImpactVal < 3.0) {
      pointsAwarded = 150; // Extra bonus for low-carbon day
      showToast(`🌟 Low-carbon logs! Saved ${totalImpactVal} kg CO₂ and earned +150 points!`);
    } else {
      showToast(`📝 Daily log updated for ${activeMemberId}. Saved ${totalImpactVal} kg CO₂. +50 points!`);
    }
    setHouseholdPoints(prev => prev + pointsAwarded);
  };

  // Add Member Action
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) {
      showToast('Please enter a valid name.', 'error');
      return;
    }
    const id = newMemberName.toLowerCase().replace(/\s+/g, '-');
    if (members.some(m => m.id === id)) {
      showToast('Member already exists!', 'error');
      return;
    }

    const colorHexes = {
      emerald: '#10B981',
      blue: '#3B82F6',
      purple: '#8B5CF6',
      rose: '#F43F5E',
      orange: '#F97316'
    };

    const newMember = {
      id,
      name: newMemberName,
      avatar: newMemberAvatar,
      color: newMemberColor,
      colorHex: colorHexes[newMemberColor] || '#10B981',
      consecutiveZeroDays: 0,
      dailyLog: {
        transport: { petrolCar: 0, dieselCar: 0, twoWheeler: 0, publicMetro: 0 },
        appliances: [
          { id: 'laptop', name: 'Laptop', wattage: 60, hours: 0, isDefault: true },
          { id: 'airConditioner', name: 'Air Conditioner', wattage: 1800, hours: 0, isDefault: true },
          { id: 'smartphoneCharger', name: 'Smartphone Charger', wattage: 10, hours: 0, isDefault: true }
        ]
      },
      history: {
        daily: [
          { day: 'Mon', value: 0 },
          { day: 'Tue', value: 0 },
          { day: 'Wed', value: 0 },
          { day: 'Thu', value: 0 },
          { day: 'Fri', value: 0 },
          { day: 'Sat', value: 0 },
          { day: 'Sun', value: 0 }
        ],
        weekly: [0, 0, 0, 0],
        monthly: { current: 0, previous: 0 }
      }
    };

    setMembers([...members, newMember]);
    setActiveMemberId(id);
    setNewMemberName('');
    showToast(`Welcome ${newMemberName} to the EcoTrace Hub! 🌱`);
  };

  // Delete Member Action
  const handleDeleteMember = (idToDelete, event) => {
    event.stopPropagation();
    if (members.length <= 1) {
      showToast('You must keep at least one household member.', 'error');
      return;
    }
    setMembers(prev => prev.filter(m => m.id !== idToDelete));
    if (activeMemberId === idToDelete) {
      const remaining = members.filter(m => m.id !== idToDelete);
      setActiveMemberId(remaining[0].id);
    }
    showToast('Member removed from household.');
  };

  // LCA Math Calculations
  const calculateLcaA = () => {
    // Factory Cost
    if (selectedLcaProduct.id === 'hairdryer') {
      return (selectedLcaProduct.mfgDebt / selectedLcaProduct.lifespan) * lcaUsage;
    } else {
      return (selectedLcaProduct.mfgDebt / selectedLcaProduct.lifespan) * lcaUsage; // inputs is days of ownership
    }
  };

  const calculateLcaB = () => {
    // Electricity Cost
    if (selectedLcaProduct.id === 'hairdryer') {
      return (selectedLcaProduct.wattage * (lcaUsage / 60) / 1000) * GRID_FACTOR;
    } else {
      // Laptop or Smartphone: days * hours/day
      const totalHours = lcaUsage * lcaUseHours;
      return (selectedLcaProduct.wattage * totalHours / 1000) * GRID_FACTOR;
    }
  };

  const lcaA = calculateLcaA();
  const lcaB = calculateLcaB();
  const lcaTotal = lcaA + lcaB;

  // Household Dashboard Aggregates
  const getHouseholdEmissionsToday = () => {
    return members.reduce((sum, m) => {
      const transport =
        m.dailyLog.transport.petrolCar * TRANSPORT_FACTORS.petrolCar +
        m.dailyLog.transport.dieselCar * TRANSPORT_FACTORS.dieselCar +
        m.dailyLog.transport.twoWheeler * TRANSPORT_FACTORS.twoWheeler +
        m.dailyLog.transport.publicMetro * TRANSPORT_FACTORS.publicMetro;

      const appliances = Array.isArray(m.dailyLog.appliances)
        ? m.dailyLog.appliances.reduce((s, app) => s + ((app.wattage * app.hours) / 1000) * GRID_FACTOR, 0)
        : 0;

      return sum + transport + appliances;
    }, 0);
  };

  // Get ranked daily leaderboard
  const getDailyLeaderboard = () => {
    return members.map(m => {
      const todayVal =
        m.dailyLog.transport.petrolCar * TRANSPORT_FACTORS.petrolCar +
        m.dailyLog.transport.dieselCar * TRANSPORT_FACTORS.dieselCar +
        m.dailyLog.transport.twoWheeler * TRANSPORT_FACTORS.twoWheeler +
        m.dailyLog.transport.publicMetro * TRANSPORT_FACTORS.publicMetro +
        (Array.isArray(m.dailyLog.appliances)
          ? m.dailyLog.appliances.reduce((s, app) => s + ((app.wattage * app.hours) / 1000) * GRID_FACTOR, 0)
          : 0);

      return {
        ...m,
        todayEmissions: Number(todayVal.toFixed(2))
      };
    }).sort((a, b) => a.todayEmissions - b.todayEmissions); // lowest emissions first
  };

  // Monthly Aggregate Comparisons
  const getMonthlyEmissions = () => {
    let currentTotal = 0;
    let previousTotal = 0;
    members.forEach(m => {
      currentTotal += m.history.monthly.current || 0;
      previousTotal += m.history.monthly.previous || 0;
    });

    let percentReduction = 0;
    if (previousTotal > 0) {
      percentReduction = ((previousTotal - currentTotal) / previousTotal) * 100;
    }
    return {
      current: Number(currentTotal.toFixed(1)),
      previous: Number(previousTotal.toFixed(1)),
      reduction: Number(percentReduction.toFixed(1))
    };
  };

  const monthlyStats = getMonthlyEmissions();

  // Watch for switching to Monthly tab to trigger celebration overlay
  useEffect(() => {
    if (activeTab === 'dashboard' && dashboardPeriod === 'monthly') {
      if (monthlyStats.reduction > 0 && !monthlyMilestoneClaimed) {
        setShowMilestoneOverlay(true);
      }
    }
  }, [activeTab, dashboardPeriod, monthlyStats.reduction, monthlyMilestoneClaimed]);

  const claimMonthlyMilestone = () => {
    setHouseholdPoints(prev => prev + 500);
    setMonthlyMilestoneClaimed(true);
    setShowMilestoneOverlay(false);
    showToast('🎉 Eco-Savings Milestone Claimed! +500 Household Points!');
  };

  // File Drag & Drop Handlers for Bill Verification
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
      startSimulation(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
      startSimulation(files[0]);
    }
  };

  // Simulated AI Verification Flow
  const startSimulation = (file) => {
    if (!file) return;
    setVerificationStep(1);

    const member = members.find(m => m.id === verificationMemberId);
    const targetMemberName = member ? member.name.toLowerCase() : '';
    const fileName = file.name.toLowerCase();

    const isNameMatch = targetMemberName && fileName.includes(targetMemberName);

    // Step 1: Scanning metadata (0.6s)
    setTimeout(() => {
      setVerificationStep(2);

      // Step 2: Account duplication (1.2s)
      setTimeout(() => {
        setVerificationStep(3);

        // Step 3: Text alignment & tampering (1.8s)
        setTimeout(() => {
          setVerificationStep(4);

          // Step 4: Historical baselines (2.4s)
          setTimeout(() => {
            setVerificationStep(5);
            setVerificationSuccess(isNameMatch);
            if (!isNameMatch) {
              showToast('❌ Verification Failed: Account name mismatch.', 'error');
            }
          }, 600);
        }, 600);
      }, 600);
    }, 600);
  };

  const confirmVerificationSuccess = () => {
    // Update global state: Clear consecutiveZeroDays of active/verified member (e.g. Rahul or Priya)
    setMembers(prevMembers =>
      prevMembers.map(m => {
        if (m.id === verificationMemberId) {
          return {
            ...m,
            consecutiveZeroDays: 0 // Reset zero days counter (fraud status cleared!)
          };
        }
        return m;
      })
    );

    // Unlock Tata Power Cashback reward and award points
    setUnlockedVouchers(prev => ({
      ...prev,
      'tata-cashback': 'TATA-SAVE-995X'
    }));

    setHouseholdPoints(prev => prev + 1000);
    showToast('✅ Account Verified! tata-cashback voucher unlocked, 1000 Points awarded, and fraud status cleared.');

    // Reset modal
    setShowVerificationModal(false);
    setVerificationStep(0);
    setSelectedFile(null);
    setVerificationSuccess(false);
  };

  // Redeem Normal Rewards
  const handleRedeemReward = (reward) => {
    // Check if points are enough
    if (householdPoints < reward.cost) {
      showToast('Insufficient household points to redeem this reward.', 'error');
      return;
    }

    // Check if there are any fraud warning indicators active in the household
    const isFraudActive = members.some(m => m.consecutiveZeroDays >= 3);
    if (isFraudActive) {
      showToast('⚠️ Rewards paused due to unverified profiles. Please upload verification bills to resume.', 'error');
      return;
    }

    setHouseholdPoints(prev => prev - reward.cost);
    setUnlockedVouchers(prev => ({
      ...prev,
      [reward.id]: reward.code
    }));
    showToast(`🎁 Successfully redeemed: ${reward.title}!`);
  };

  // Check if any member has a fraud lock active
  const isAnyMemberFraudulent = members.some(m => m.consecutiveZeroDays >= 3);

  // SVG Chart Dimensions & Parameters
  const chartHeight = 220;
  const chartWidth = 500;
  const barPadding = 40;
  const bottomMargin = 40;
  const topMargin = 20;

  // Render App
  if (viewState === 'landing') {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans relative overflow-hidden flex flex-col justify-between">
        {/* Deep eco-dark slate background with soft green and blue radial glow effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-glow-emerald pointer-events-none rounded-full opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-glow-blue pointer-events-none rounded-full opacity-40" />
        <div className="absolute top-[30%] right-[15%] w-[350px] h-[350px] bg-gradient-to-tr from-emerald-500/10 to-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Top Navbar */}
        <header className="w-full z-45 backdrop-blur-md border-b border-slate-900/60 bg-[#0b0f19]/80 sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <Leaf className="h-6 w-6 text-emerald-400" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-500 to-blue-400 bg-clip-text text-transparent">
                EcoTrace Family Hub
              </span>
            </div>

            <button
              onClick={() => setViewState('dashboard')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-200"
            >
              Enter App 🚀
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex flex-col justify-center items-center py-20 relative z-10 text-center">
          {/* Main Hero Card/Section */}
          <div className="space-y-6 max-w-4xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider animate-pulse-dot">
              <span>🍃 Intelligent Household Carbon Auditing</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight font-outfit text-white leading-tight">
              EcoTrace <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 bg-clip-text text-transparent">Family Hub</span>
            </h1>

            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
              Track, verify, and reduce your household carbon footprint as a family, powered by advanced Gemini intelligence.
            </p>

            <div className="pt-8">
              <button
                onClick={() => setViewState('dashboard')}
                className="relative group px-10 py-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-950/50 hover:shadow-emerald-500/25 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 text-lg tracking-wide border border-emerald-400/20"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <span>Launch Dashboard</span>
                  <span className="transition-transform group-hover:translate-x-1 duration-200">🚀</span>
                </span>
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300" />
              </button>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto mt-24">
            {/* Card 1 */}
            <div className="glass-panel glass-panel-hover p-8 rounded-3xl text-left flex flex-col justify-between h-full relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80" />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                  💡
                </div>
                <h3 className="text-xl font-bold text-slate-100 font-outfit">Dynamic Tracking</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Log custom appliances (like a water heater), transport, and grid impacts instantly with real-time math.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/40 flex items-center text-xs text-emerald-400 font-semibold">
                <span>Real-Time Calculator</span>
                <span className="ml-1.5 transition-transform group-hover:translate-x-1 duration-200">→</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-panel glass-panel-hover p-8 rounded-3xl text-left flex flex-col justify-between h-full relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-teal-500 to-blue-500 opacity-80" />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                  🤖
                </div>
                <h3 className="text-xl font-bold text-slate-100 font-outfit">Gemini AI Advisor</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Access instant, localized environmental insights powered directly by Gemini.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/40 flex items-center text-xs text-blue-450 font-semibold">
                <span>Personalized Insights</span>
                <span className="ml-1.5 transition-transform group-hover:translate-x-1 duration-200">→</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass-panel glass-panel-hover p-8 rounded-3xl text-left flex flex-col justify-between h-full relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80" />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                  🛡️
                </div>
                <h3 className="text-xl font-bold text-slate-100 font-outfit">Anti-Cheat Audit</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Secure proof-of-work bill verification that matches profile names to keep family leaderboards honest.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/40 flex items-center text-xs text-indigo-400 font-semibold">
                <span>Tamper-Proof Audit</span>
                <span className="ml-1.5 transition-transform group-hover:translate-x-1 duration-200">→</span>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-slate-900/60 py-6 mt-12 bg-slate-950/20 backdrop-blur-sm z-10 text-center">
          <div className="max-w-7xl mx-auto px-4 text-xs text-slate-500 space-y-2">
            <p>EcoTrace Family Hub © 2026. Empowering green households everywhere.</p>
            <p className="text-[10px] text-slate-600">Built using advanced Gemini intelligence models.</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 relative">
      {/* Background ambient glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-glow-emerald pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-glow-blue pointer-events-none rounded-full" />

      {/* STICKY TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 shadow-lg backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewState('landing')}
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-slate-800/60 py-1.5 px-2.5 rounded-lg transition-all duration-200 mr-2 flex items-center space-x-1 shrink-0"
            >
              <span className="hidden sm:inline">← Back to Home</span>
              <span className="sm:hidden">← Home</span>
            </button>
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Leaf className="h-6 w-6 text-emerald-400" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-500 to-blue-400 bg-clip-text text-transparent">
              EcoTrace Family Hub
            </span>
          </div>

          <nav className="hidden md:flex space-x-1">
            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-2 ${activeTab === 'tracker'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent'
                }`}
            >
              <Zap className="h-4 w-4" />
              <span>📊 Daily Tracker</span>
            </button>
            <button
              onClick={() => setActiveTab('lca')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-2 ${activeTab === 'lca'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent'
                }`}
            >
              <Leaf className="h-4 w-4" />
              <span>🌱 LCA Deep-Dive</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-2 ${activeTab === 'dashboard'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent'
                }`}
            >
              <Users className="h-4 w-4" />
              <span>👨‍👩‍👧 Family Dashboard</span>
              {isAnyMemberFraudulent && (
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse-dot" />
              )}
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            {/* Points Ledger */}
            <div className="bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700/60 flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-amber-400 fill-amber-400 animate-pulse" />
              <span className="font-extrabold text-slate-100 text-sm tracking-wide">
                {householdPoints.toLocaleString()} <span className="text-slate-400 text-xs">PTS</span>
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Nav Links */}
        <div className="md:hidden border-t border-slate-800/50 flex justify-around py-2 bg-slate-900/60 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`p-2 flex flex-col items-center text-xs font-semibold ${activeTab === 'tracker' ? 'text-emerald-400' : 'text-slate-400'
              }`}
          >
            <Zap className="h-5 w-5 mb-0.5" />
            <span>Tracker</span>
          </button>
          <button
            onClick={() => setActiveTab('lca')}
            className={`p-2 flex flex-col items-center text-xs font-semibold ${activeTab === 'lca' ? 'text-emerald-400' : 'text-slate-400'
              }`}
          >
            <Leaf className="h-5 w-5 mb-0.5" />
            <span>LCA</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`p-2 flex flex-col items-center text-xs font-semibold relative ${activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-400'
              }`}
          >
            <Users className="h-5 w-5 mb-0.5" />
            <span>Dashboard</span>
            {isAnyMemberFraudulent && (
              <span className="absolute top-2 right-4 h-2 w-2 rounded-full bg-rose-500 animate-pulse-dot" />
            )}
          </button>
        </div>
      </header>

      {/* TOAST SYSTEM */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl border shadow-xl flex items-center space-x-3 backdrop-blur-md transition-all duration-300 animate-slide-up ${toast.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/30 text-rose-200'
              : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
              }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

        {/* GLOBAL MOCK FRAUD WARNING */}
        {isAnyMemberFraudulent && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-300 text-sm">Anti-Cheat Alert: Unverified Energy Logs</h4>
                <p className="text-xs text-rose-400 mt-1 leading-relaxed">
                  One or more family members have logged exactly 0 kg of CO₂ emissions for 3+ consecutive days. Premium rewards are locked until verification proof is provided.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const fraudMember = members.find(m => m.consecutiveZeroDays >= 3);
                if (fraudMember) {
                  setVerificationMemberId(fraudMember.id);
                  setVerificationStep(0);
                  setShowVerificationModal(true);
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shrink-0 shadow-lg shadow-rose-950"
            >
              Verify Accounts Now
            </button>
          </div>
        )}

        {/* ======================================================================= */}
        {/* MODULE 1: DAILY TRACKER */}
        {/* ======================================================================= */}
        {activeTab === 'tracker' && (
          <section className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-white font-outfit">Daily Operational Emissions</h2>
                <p className="text-slate-400 text-sm mt-1">Calculate and commit your daily carbon footprint based on your real habits.</p>
              </div>
            </div>

            {/* Member selector */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 shadow-md">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">
                1. Logging data for:
              </span>
              <div className="flex flex-wrap gap-4">
                {members.map((member) => {
                  const isActive = member.id === activeMemberId;
                  const isFraud = member.consecutiveZeroDays >= 3;
                  return (
                    <button
                      key={member.id}
                      onClick={() => setActiveMemberId(member.id)}
                      className={`relative flex items-center space-x-3 px-4 py-3 rounded-xl border text-left transition-all duration-300 ${isActive
                        ? `bg-slate-800 border-${member.color}-500/50 shadow-md`
                        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/80'
                        }`}
                      style={{
                        borderColor: isActive ? member.colorHex : 'transparent'
                      }}
                    >
                      <div className="relative">
                        <span className="text-2xl">{member.avatar}</span>
                        {isFraud && (
                          <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white shadow-lg border border-[#0b0f19]">
                            !
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-200">{member.name}</h4>
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">
                          {isFraud ? '⚠️ Locked' : 'Verified'}
                        </span>
                      </div>
                      {isActive && (
                        <div className="h-1.5 w-1.5 rounded-full absolute bottom-1 right-1" style={{ backgroundColor: member.colorHex }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Panel tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* Sliders Input Panel */}
              <div className="lg:col-span-8 glass-panel rounded-3xl border border-slate-800/85 overflow-hidden shadow-xl">

                {/* Internal Tabs */}
                <div className="bg-slate-900/60 px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setTrackerSubTab('transport')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${trackerSubTab === 'transport'
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                      <Car className="h-3.5 w-3.5" />
                      <span>🚗 Transport</span>
                    </button>
                    <button
                      onClick={() => setTrackerSubTab('appliances')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${trackerSubTab === 'appliances'
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                      <Tv className="h-3.5 w-3.5" />
                      <span>🔌 Quick Appliances</span>
                    </button>
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded">
                    Grid Factor: {GRID_FACTOR} kg/kWh
                  </span>
                </div>

                {/* Sub Tab: Transport */}
                {trackerSubTab === 'transport' && (
                  <div className="p-6 space-y-6">
                    {/* Petrol Car */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-200 flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                          <span>Petrol Car</span>
                        </span>
                        <span className="font-mono text-slate-400">
                          {transportInputs.petrolCar} km <span className="text-[10px] text-slate-500">({(transportInputs.petrolCar * TRANSPORT_FACTORS.petrolCar).toFixed(2)} kg CO₂)</span>
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={transportInputs.petrolCar}
                        onChange={(e) => setTransportInputs({ ...transportInputs, petrolCar: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>0 km</span>
                        <span>0.18 kg CO₂/km</span>
                        <span>100 km</span>
                      </div>
                    </div>

                    {/* Diesel Car */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-200 flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                          <span>Diesel Car</span>
                        </span>
                        <span className="font-mono text-slate-400">
                          {transportInputs.dieselCar} km <span className="text-[10px] text-slate-500">({(transportInputs.dieselCar * TRANSPORT_FACTORS.dieselCar).toFixed(2)} kg CO₂)</span>
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={transportInputs.dieselCar}
                        onChange={(e) => setTransportInputs({ ...transportInputs, dieselCar: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>0 km</span>
                        <span>0.20 kg CO₂/km</span>
                        <span>100 km</span>
                      </div>
                    </div>

                    {/* Two-Wheeler */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-200 flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                          <span>Two-Wheeler (Motorcycle/Scooter)</span>
                        </span>
                        <span className="font-mono text-slate-400">
                          {transportInputs.twoWheeler} km <span className="text-[10px] text-slate-500">({(transportInputs.twoWheeler * TRANSPORT_FACTORS.twoWheeler).toFixed(2)} kg CO₂)</span>
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={transportInputs.twoWheeler}
                        onChange={(e) => setTransportInputs({ ...transportInputs, twoWheeler: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>0 km</span>
                        <span>0.05 kg CO₂/km</span>
                        <span>100 km</span>
                      </div>
                    </div>

                    {/* Public Metro / Bus */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-200 flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                          <span>Public Metro / Bus</span>
                        </span>
                        <span className="font-mono text-slate-400">
                          {transportInputs.publicMetro} km <span className="text-[10px] text-slate-500">({(transportInputs.publicMetro * TRANSPORT_FACTORS.publicMetro).toFixed(2)} kg CO₂)</span>
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={transportInputs.publicMetro}
                        onChange={(e) => setTransportInputs({ ...transportInputs, publicMetro: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>0 km</span>
                        <span>0.02 kg CO₂/km</span>
                        <span>100 km</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub Tab: Appliances */}
                {trackerSubTab === 'appliances' && (
                  <div className="p-6 space-y-6">
                    {Array.isArray(applianceInputs) && applianceInputs.map((app) => {
                      const itemImpact = ((app.wattage * app.hours) / 1000) * GRID_FACTOR;
                      let dotColor = 'bg-emerald-400';
                      if (app.id === 'laptop') dotColor = 'bg-blue-400';
                      else if (app.id === 'airConditioner') dotColor = 'bg-rose-400';
                      else if (app.id === 'smartphoneCharger') dotColor = 'bg-purple-400';
                      else if (app.isCustom) dotColor = 'bg-amber-400';

                      return (
                        <div key={app.id} className="space-y-2 p-4 bg-slate-900/30 rounded-2xl border border-slate-800/50 hover:bg-slate-900/60 transition-all animate-slide-up">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-slate-200 flex items-center space-x-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                              <span>{app.name} ({app.wattage} Watts)</span>
                            </span>
                            <div className="flex items-center space-x-3">
                              <span className="font-mono text-slate-400">
                                {app.hours} hrs <span className="text-[10px] text-slate-500">({itemImpact.toFixed(3)} kg CO₂)</span>
                              </span>
                              {app.isCustom && (
                                <button
                                  onClick={() => {
                                    setApplianceInputs(applianceInputs.filter(item => item.id !== app.id));
                                    showToast(`Removed custom appliance: ${app.name}`);
                                  }}
                                  className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors"
                                  title="Remove appliance"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          // Look around line 1186 in src/App.jsx:
                          <input
                            min="0"
                            max="24"
                            step="0.5"
                            aria-label={`Daily usage hours for ${app.name || 'appliance'}`}
                            value={app.hours}
                            onChange={(e) => {
                              const sanitized = e.target.value.replace(/[^0-9.]/g, '');
                              const val = Number(sanitized) || 0;
                              setApplianceInputs(applianceInputs.map(item => item.id === app.id ? { ...item, hours: val } : item));
                            }}
                            className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>0 hrs</span>
                            <span>Grid factor: {GRID_FACTOR} kg/kWh</span>
                            <span>24 hrs</span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Custom Appliance Form */}
                    <div className="pt-6 border-t border-slate-800/60 mt-6">
                      <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center space-x-2">
                        <span>➕ Add Custom Appliance</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 shadow-md">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-400 block">Appliance Name:</label>
                          <input
                            type="text"
                            placeholder="e.g. Water Heater"
                            value={customAppName}
                            onChange={(e) => setCustomAppName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-400 block">Power (Watts):</label>
                          <input
                            type="number"
                            placeholder="e.g. 2000"
                            value={customAppWatts}
                            onChange={(e) => setCustomAppWatts(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-400 block">Hours Used:</label>
                          <input
                            type="number"
                            min="0"
                            max="24"
                            step="0.1"
                            value={customAppHours}
                            onChange={(e) => setCustomAppHours(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!customAppName.trim()) {
                              showToast('Please enter an appliance name.', 'error');
                              return;
                            }
                            const watts = Number(customAppWatts);
                            if (isNaN(watts) || watts <= 0) {
                              showToast('Please enter a valid power rating in Watts.', 'error');
                              return;
                            }
                            const hours = Number(customAppHours);
                            if (isNaN(hours) || hours < 0 || hours > 24) {
                              showToast('Hours must be between 0 and 24.', 'error');
                              return;
                            }

                            const newApp = {
                              id: `custom-${Date.now()}`,
                              name: customAppName,
                              wattage: watts,
                              hours: hours,
                              isCustom: true
                            };

                            setApplianceInputs([...applianceInputs, newApp]);
                            showToast(`Added custom appliance: ${customAppName}`);
                            setCustomAppName('');
                            setCustomAppWatts('');
                            setCustomAppHours(1.5);
                          }}
                          className="w-full py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 h-10"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add to Log</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Side Summary Panel */}
              <div className="lg:col-span-4 space-y-6">

                {/* Live Output */}
                <div className="glass-panel rounded-3xl p-6 border border-slate-800/80 flex flex-col justify-between h-full shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest rounded-bl-xl border-l border-b border-emerald-500/20">
                    Live Calculator
                  </div>

                  <div className="space-y-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Summary stats</span>
                    <div>
                      <span className="text-3xl font-extrabold text-white font-outfit">
                        {liveTotalImpact.toFixed(2)}
                      </span>
                      <span className="text-slate-400 text-sm ml-2">kg CO₂</span>
                    </div>

                    {/* Breakdown graphics */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Transport:</span>
                        <span className="font-mono">{calculateLiveTransportImpact().toFixed(2)} kg</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{
                            width: `${liveTotalImpact > 0 ? (calculateLiveTransportImpact() / liveTotalImpact) * 100 : 0}%`
                          }}
                        />
                        <div
                          className="bg-blue-400 h-full"
                          style={{
                            width: `${liveTotalImpact > 0 ? (calculateLiveApplianceImpact() / liveTotalImpact) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Appliances:</span>
                        <span className="font-mono">{calculateLiveApplianceImpact().toFixed(2)} kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Indicator Badge */}
                  <div className="my-6 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 text-center">
                    <span className="text-sm font-bold text-emerald-400 flex items-center justify-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>⚡ Live Impact: {liveTotalImpact.toFixed(2)} kg CO₂</span>
                    </span>
                  </div>

                  <button
                    onClick={handleSaveDailyLog}
                    className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/60 transform hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm flex items-center justify-center space-x-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>Save Daily Log</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================================= */}
        {/* MODULE 2: LCA DEEP-DIVE */}
        {/* ======================================================================= */}
        {activeTab === 'lca' && (
          <section className="space-y-6 animate-slide-up">
            <div>
              <h2 className="text-3xl font-extrabold text-white font-outfit">Cradle-to-Grave Life Assessment (LCA)</h2>
              <p className="text-slate-400 text-sm mt-1">
                Explore the manufacturing vs. use-phase electricity carbon debt of electronics.
              </p>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {LCA_PRODUCTS.map((prod) => {
                const isSelected = prod.id === selectedLcaProduct.id;
                return (
                  <button
                    key={prod.id}
                    onClick={() => {
                      setSelectedLcaProduct(prod);
                      setLcaUsage(prod.defaultUsage);
                      if (prod.defaultUseHours) {
                        setLcaUseHours(prod.defaultUseHours);
                      }
                    }}
                    className={`glass-panel p-6 rounded-3xl text-left border relative overflow-hidden transition-all duration-300 ${isSelected
                      ? 'border-emerald-500 bg-slate-800/70 shadow-lg shadow-emerald-950/20'
                      : 'border-slate-850 hover:border-slate-700/80 hover:bg-slate-800/35'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-4xl">{prod.icon}</span>
                      <span className="bg-slate-900 text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded border border-slate-800">
                        {prod.wattage}W Power
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-100">{prod.name}</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{prod.desc}</p>

                    <div className="mt-4 pt-4 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block">Mfg Debt:</span>
                        <span className="font-semibold text-emerald-400">{prod.mfgDebt} kg CO₂</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Est. Lifespan:</span>
                        <span className="font-semibold text-slate-300">{prod.lifespan} {prod.unit}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive LCA Calculator & Comparative cards */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/60">
                <div>
                  <h4 className="font-bold text-lg text-slate-100 flex items-center space-x-2">
                    <span>Configure Use Phase for</span>
                    <span className="text-emerald-400 font-extrabold">{selectedLcaProduct.name}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Adjust usage duration to calculate live environmental debt distribution.</p>
                </div>

                {/* Dynamic Inputs depending on units */}
                <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                  {selectedLcaProduct.id === 'hairdryer' ? (
                    <div className="space-y-1.5 w-full sm:w-48">
                      <label className="text-xs font-semibold text-slate-400 block">Minutes of Session:</label>
                      <input
                        type="number"
                        min="1"
                        max="180"
                        value={lcaUsage}
                        onChange={(e) => setLcaUsage(Math.max(1, Number(e.target.value)))}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono w-full focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1.5 w-full sm:w-36">
                        <label className="text-xs font-semibold text-slate-400 block">Days of Ownership:</label>
                        <input
                          type="number"
                          min="1"
                          max="3650"
                          value={lcaUsage}
                          onChange={(e) => setLcaUsage(Math.max(1, Number(e.target.value)))}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono w-full focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1.5 w-full sm:w-36">
                        <label className="text-xs font-semibold text-slate-400 block">Hours used / day:</label>
                        <input
                          type="number"
                          min="0.5"
                          max="24"
                          step="0.5"
                          value={lcaUseHours}
                          onChange={(e) => setLcaUseHours(Math.max(0.5, Math.min(24, Number(e.target.value))))}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono w-full focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Outputs side-by-side card layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Card A: Factory cost */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-900/20 border border-slate-800/80 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <span>🏭</span>
                      <span>Card A: The Factory Cost</span>
                    </div>
                    <h5 className="font-extrabold text-2xl text-emerald-400 font-outfit mt-4">
                      Amortized Manufacturing Share: {lcaA.toFixed(2)} kg CO₂
                    </h5>
                  </div>
                  <div className="text-xs text-slate-500 leading-relaxed font-mono">
                    Formula: (Total Mfg Debt: {selectedLcaProduct.mfgDebt} kg / Total Lifespan: {selectedLcaProduct.lifespan} {selectedLcaProduct.unit})
                    * Usage ({lcaUsage} {selectedLcaProduct.unit})
                  </div>
                </div>

                {/* Card B: Electricity cost */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-900/20 border border-slate-800/80 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <span>🔌</span>
                      <span>Card B: The Electricity Cost</span>
                    </div>
                    <h5 className="font-extrabold text-2xl text-amber-400 font-outfit mt-4">
                      Use-Phase Impact: {lcaB.toFixed(2)} kg CO₂
                    </h5>
                  </div>
                  <div className="text-xs text-slate-500 leading-relaxed font-mono">
                    Formula: ({selectedLcaProduct.wattage} Watts * Total Hours:
                    {selectedLcaProduct.id === 'hairdryer' ? ` ${(lcaUsage / 60).toFixed(2)} hrs` : ` ${lcaUsage * lcaUseHours} hrs`}
                    / 1000) * Grid average ({GRID_FACTOR} kg/kWh)
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2 pt-4">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-300">Total Lifecycle Impact for this session:</span>
                  <span className="text-lg text-emerald-400 font-mono font-bold">
                    {lcaTotal.toFixed(2)} kg CO₂
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden flex border border-slate-800">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${(lcaA / lcaTotal) * 100}%` }}
                    title={`Manufacturing share: ${((lcaA / lcaTotal) * 100).toFixed(1)}%`}
                  />
                  <div
                    className="bg-amber-500 h-full transition-all duration-300"
                    style={{ width: `${(lcaB / lcaTotal) * 100}%` }}
                    title={`Electricity use-phase share: ${((lcaB / lcaTotal) * 100).toFixed(1)}%`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Factory debt: {((lcaA / lcaTotal) * 100 || 0).toFixed(1)}%</span>
                  <span>Use-Phase electricity debt: {((lcaB / lcaTotal) * 100 || 0).toFixed(1)}%</span>
                </div>
              </div>

              {/* Educational callout */}
              <div className="p-4 rounded-2xl bg-emerald-950/10 border border-emerald-500/20 text-xs text-emerald-400/90 leading-relaxed flex items-start space-x-3">
                <span className="text-base">💡</span>
                <p>
                  <strong className="text-emerald-300">Did you know?</strong> Over 80% of a laptop or phone's carbon footprint comes from the factory before you even open the box. Extending device longevity (e.g. using a smartphone for 4 years instead of 2) drastically cuts this amortized manufacturing debt.
                </p>
              </div>

            </div>
          </section>
        )}

        {/* ======================================================================= */}
        {/* MODULE 3: FAMILY DASHBOARD */}
        {/* ======================================================================= */}
        {activeTab === 'dashboard' && (
          <section className="space-y-8 animate-slide-up">

            {/* Title and period toggler */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-white font-outfit">Family Cockpit Analytics</h2>
                <p className="text-slate-400 text-sm mt-1">Aggregated trackers, weekly bar charts, rewards, and anti-cheat modules.</p>
              </div>

              {/* Time Frame selector */}
              <div className="flex space-x-1 bg-slate-900 border border-slate-800 p-1.5 rounded-xl shrink-0">
                <button
                  onClick={() => setDashboardPeriod('daily')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${dashboardPeriod === 'daily'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  📅 Daily View
                </button>
                <button
                  onClick={() => setDashboardPeriod('weekly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${dashboardPeriod === 'weekly'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  🗓️ Weekly View
                </button>
                <button
                  onClick={() => setDashboardPeriod('monthly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${dashboardPeriod === 'monthly'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  📈 Monthly Analysis
                </button>
              </div>
            </div>

            {/* Sub-Section display based on Period */}
            {dashboardPeriod === 'daily' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Household Aggregate Emissions Metric Card */}
                <div className="lg:col-span-4 glass-panel rounded-3xl p-6 border border-slate-800/80 flex flex-col justify-between h-56 shadow-xl relative">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Household total today</span>
                    <h3 className="text-5xl font-black text-emerald-400 font-outfit mt-4">
                      {getHouseholdEmissionsToday().toFixed(2)}
                    </h3>
                    <span className="text-slate-400 text-sm mt-1 block font-semibold">kg CO₂ Emitted</span>
                  </div>
                  <div className="text-xs text-slate-500 border-t border-slate-800/60 pt-4 font-mono">
                    Aggregated emissions across all {members.length} members.
                  </div>
                </div>

                {/* Leaderboard ranking members lowest emissions to highest */}
                <div className="lg:col-span-8 glass-panel rounded-3xl p-6 border border-slate-800/80 shadow-xl">
                  <h4 className="font-bold text-lg text-slate-200 mb-6 flex items-center justify-between">
                    <span>🏆 Family Green Leaderboard</span>
                    <span className="text-xs text-slate-500">Ranked from lowest emissions</span>
                  </h4>

                  <div className="space-y-4">
                    {getDailyLeaderboard().map((member, index) => {
                      const isFraud = member.consecutiveZeroDays >= 3;
                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/60 rounded-2xl transition-all"
                        >
                          <div className="flex items-center space-x-4">
                            <span className="font-bold text-slate-500 text-sm font-mono w-6 text-center">
                              #{index + 1}
                            </span>
                            <span className="text-3xl">{member.avatar}</span>
                            <div>
                              <h5 className="font-bold text-sm text-slate-200">{member.name}</h5>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {isFraud ? '⚠️ Rewards paused (0-logs)' : 'Status: Normal'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <span className="font-mono text-slate-100 font-bold block">
                                {member.todayEmissions} kg
                              </span>
                              <span className="text-[10px] text-slate-500 block">CO₂ today</span>
                            </div>
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: isFraud ? '#EF4444' : (index === 0 ? '#10B981' : member.colorHex)
                              }}
                            />
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {dashboardPeriod === 'weekly' && (
              <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-6">
                <div>
                  <h4 className="font-bold text-lg text-slate-200">Weekly Carbon Accumulation</h4>
                  <p className="text-xs text-slate-400 mt-1">Side-by-side family carbon footprint comparison for this week.</p>
                </div>

                {/* Custom SVG Bar Chart comparing total weekly accumulation */}
                <div className="w-full flex justify-center py-6 overflow-x-auto">
                  <svg
                    width={chartWidth}
                    height={chartHeight}
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="overflow-visible"
                  >
                    {/* Grid Lines */}
                    {[0, 25, 50, 75, 100].map((gridVal) => {
                      const yPos = topMargin + ((100 - gridVal) / 100) * (chartHeight - topMargin - bottomMargin);
                      return (
                        <g key={gridVal}>
                          <line
                            x1={barPadding}
                            y1={yPos}
                            x2={chartWidth - barPadding}
                            y2={yPos}
                            stroke="#1e293b"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={barPadding - 10}
                            y={yPos + 4}
                            fill="#64748b"
                            fontSize="10"
                            className="font-mono text-right"
                            textAnchor="end"
                          >
                            {gridVal}
                          </text>
                        </g>
                      );
                    })}

                    {/* Chart Bars */}
                    {members.map((member, i) => {
                      // Sum the 7 daily log values to get weekly accumulation
                      const weeklySum = member.history.daily.reduce((sum, item) => sum + item.value, 0);
                      const maxVal = 100; // grid cap for height scaling
                      const scaledHeight = Math.min(1, weeklySum / maxVal) * (chartHeight - topMargin - bottomMargin);

                      const numBars = members.length;
                      const graphWidth = chartWidth - (barPadding * 2);
                      const barGroupWidth = graphWidth / numBars;
                      const barWidth = Math.max(24, barGroupWidth * 0.4);
                      const xPos = barPadding + (i * barGroupWidth) + (barGroupWidth - barWidth) / 2;
                      const yPos = chartHeight - bottomMargin - scaledHeight;

                      return (
                        <g key={member.id} className="group">
                          {/* Hover Tooltip Box */}
                          <rect
                            x={xPos - 30}
                            y={yPos - 30}
                            width="84"
                            height="20"
                            rx="4"
                            fill="#0f172a"
                            stroke="#334155"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                          />
                          <text
                            x={xPos + barWidth / 2}
                            y={yPos - 16}
                            fill="#f8fafc"
                            fontSize="9"
                            fontWeight="bold"
                            textAnchor="middle"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none font-mono"
                          >
                            {weeklySum.toFixed(1)} kg CO₂
                          </text>

                          {/* Bar Graphic with gradient */}
                          <defs>
                            <linearGradient id={`grad-${member.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={member.colorHex} stopOpacity="1" />
                              <stop offset="100%" stopColor={member.colorHex} stopOpacity="0.2" />
                            </linearGradient>
                          </defs>

                          <rect
                            x={xPos}
                            y={yPos}
                            width={barWidth}
                            height={scaledHeight > 4 ? scaledHeight : 4}
                            rx="6"
                            fill={`url(#grad-${member.id})`}
                            className="cursor-pointer hover:brightness-125 transition-all duration-200"
                          />

                          {/* Member name & Avatar baseline */}
                          <text
                            x={xPos + barWidth / 2}
                            y={chartHeight - bottomMargin + 18}
                            fill="#cbd5e1"
                            fontSize="11"
                            fontWeight="semibold"
                            textAnchor="middle"
                          >
                            {member.avatar} {member.name}
                          </text>

                          {/* Under label values */}
                          <text
                            x={xPos + barWidth / 2}
                            y={chartHeight - bottomMargin + 32}
                            fill="#64748b"
                            fontSize="9"
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            {weeklySum.toFixed(1)} kg
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}

            {dashboardPeriod === 'monthly' && (
              <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-6">
                <div>
                  <h4 className="font-bold text-lg text-slate-200">Current Month Grid Optimization</h4>
                  <p className="text-xs text-slate-400 mt-1">Aggregated emissions and previous month comparison performance indicators.</p>
                </div>

                {/* Monthly comparison block */}
                <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <h5 className="font-semibold text-slate-200 flex items-center space-x-2">
                      <TrendingDown className="h-5 w-5 text-emerald-400" />
                      <span>Monthly Analysis Overview</span>
                    </h5>

                    <p className="text-sm text-slate-300">
                      Our aggregated household footprint is{' '}
                      <span className="font-extrabold text-emerald-400">
                        {monthlyStats.current} kg CO₂
                      </span>{' '}
                      this month, compared to{' '}
                      <span className="text-slate-400">{monthlyStats.previous} kg CO₂</span>{' '}
                      last month.
                    </p>

                    {/* Comparative calculation text block */}
                    <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg inline-block">
                      📉 Great Job! This month's household emissions are {monthlyStats.reduction}% lower than last month.
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button
                      onClick={() => {
                        if (monthlyStats.reduction > 0) {
                          setShowMilestoneOverlay(true);
                        } else {
                          showToast('No reduction achieved this month to claim milestone.', 'error');
                        }
                      }}
                      className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all"
                    >
                      {monthlyMilestoneClaimed ? '🌟 Milestone Claimed' : '🎉 Open Celebration'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Member Block */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-xl">
              <h4 className="font-bold text-lg text-slate-200 mb-6 flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-emerald-400" />
                <span>Add Household Member</span>
              </h4>

              <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 block">Member Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter name (e.g. Rahul)"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 block">Choose Avatar Emojis:</label>
                  <div className="flex space-x-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl justify-between">
                    {['👦', '👧', '👩', '👨', '👵', '👴'].map(av => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setNewMemberAvatar(av)}
                        className={`text-xl p-1 rounded-md transition-all ${newMemberAvatar === av ? 'bg-slate-800 border border-slate-700 scale-110' : 'hover:scale-105'
                          }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 block">Choose Color Theme:</label>
                  <div className="flex space-x-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl justify-around">
                    {['emerald', 'blue', 'purple', 'rose', 'orange'].map((col) => {
                      const bgColors = {
                        emerald: 'bg-emerald-500',
                        blue: 'bg-blue-500',
                        purple: 'bg-purple-500',
                        rose: 'bg-rose-500',
                        orange: 'bg-orange-500'
                      };
                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setNewMemberColor(col)}
                          className={`w-6 h-6 rounded-full border border-slate-950 transition-all ${bgColors[col]} ${newMemberColor === col ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                            }`}
                        />
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Member</span>
                </button>
              </form>

              {/* Member cards drawer for simple management & deleting */}
              <div className="mt-6 pt-6 border-t border-slate-800/60">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">Household Registry ({members.length})</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {members.map(m => (
                    <div key={m.id} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{m.avatar}</span>
                        <span className="text-sm font-semibold text-slate-200">{m.name}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteMember(m.id, e)}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sponsor Marketplace & Bill Vault */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-6">
              <div>
                <h4 className="font-bold text-lg text-slate-200">Green Sponsor Marketplace</h4>
                <p className="text-xs text-slate-400 mt-1">Claim or redeem cashback rewards funded by sustainable brand sponsorships.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {REWARDS_DATA.map((reward) => {
                  const isUnlocked = unlockedVouchers[reward.id];

                  return (
                    <div
                      key={reward.id}
                      className="glass-panel p-6 rounded-2xl border border-slate-850 flex flex-col justify-between space-y-4 relative overflow-hidden"
                    >
                      {reward.requiresVerification && !isUnlocked && (
                        <div className="absolute top-0 right-0 bg-rose-500/10 px-2 py-0.5 text-[8px] font-bold text-rose-400 uppercase tracking-widest rounded-bl-lg border-l border-b border-rose-500/20 flex items-center space-x-1">
                          <Lock className="h-2 w-2" />
                          <span>Requires Verification Proof</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-500 font-mono block uppercase">{reward.sponsor}</span>
                        <h5 className="font-bold text-slate-100 text-base">{reward.title}</h5>
                        <p className="text-xs text-slate-400 leading-relaxed">{reward.description}</p>
                      </div>

                      <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                        <div>
                          {reward.cost > 0 ? (
                            <span className="text-xs font-bold font-mono text-amber-400">
                              🪙 {reward.cost} PTS
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-emerald-400">
                              FREE (With Bill Verification)
                            </span>
                          )}
                        </div>

                        {isUnlocked ? (
                          <div className="text-right">
                            <span className="text-[10px] text-emerald-400 block uppercase font-bold">Voucher Unlocked:</span>
                            <span className="font-mono text-xs text-white font-bold bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                              {isUnlocked}
                            </span>
                          </div>
                        ) : reward.requiresVerification ? (
                          <button
                            onClick={() => {
                              setVerificationMemberId(activeMemberId);
                              setVerificationStep(0);
                              setShowVerificationModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all flex items-center space-x-1 shadow-md shadow-emerald-950"
                          >
                            <span>Verify via Bill</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRedeemReward(reward)}
                            disabled={isAnyMemberFraudulent}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center space-x-1 shadow-md ${isAnyMemberFraudulent
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/30'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-950'
                              }`}
                          >
                            <span>Redeem coupon</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </section>
        )}

      </main>

      {/* ======================================================================= */}
      {/* CELEBRATION OVERLAY */}
      {/* ======================================================================= */}
      {showMilestoneOverlay && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 max-w-md w-full text-center space-y-6 animate-slide-up shadow-2xl relative">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center text-4xl">
              🎉
            </div>

            <div className="space-y-2 pt-6">
              <h3 className="font-extrabold text-2xl text-white font-outfit">Milestone Unlocked!</h3>
              <p className="text-slate-400 text-xs">
                Your family emissions this month are <span className="font-extrabold text-emerald-400">{monthlyStats.reduction}% lower</span> than last month.
                You've successfully unlocked the monthly carbon reduction challenge!
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-center space-x-3">
              <Award className="h-8 w-8 text-amber-400 animate-bounce" />
              <div className="text-left">
                <span className="text-[10px] text-slate-500 block uppercase font-bold font-mono">Award Reward</span>
                <span className="text-base font-extrabold text-slate-100">+500 Household Points</span>
              </div>
            </div>

            <button
              onClick={claimMonthlyMilestone}
              className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-950 transition-all text-sm"
            >
              Claim Milestone Points
            </button>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* BILL VAULT VERIFICATION MODAL */}
      {/* ======================================================================= */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-xl w-full rounded-3xl border border-slate-800/80 shadow-2xl animate-slide-up overflow-hidden">

            {/* Header */}
            <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-800/60 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-slate-200">Bill Vault: Fraud Protection AI Audit</h3>
              </div>
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  setVerificationStep(0);
                  setSelectedFile(null);
                  setVerificationSuccess(false);
                }}
                className="text-slate-450 hover:text-slate-200 font-bold text-sm"
              >
                ✕ Close
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 space-y-6">

              {/* Selector for which member bill belongs to */}
              {verificationStep === 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 block">Identify account member to verify:</label>
                  <select
                    value={verificationMemberId}
                    onChange={(e) => setVerificationMemberId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Stage 0: Drop zone */}
              {verificationStep === 0 && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${isDragging
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : 'border-slate-800 bg-slate-900/20 hover:border-slate-700/80'
                    }`}
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400">
                      <UploadCloud className="h-8 w-8" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-200 text-sm">Upload your Monthly Electricity Bill</h5>
                      <p className="text-slate-500 text-xs mt-1">
                        PDF or Image to scan Name, Date, and Units.
                      </p>
                    </div>
                    <div className="relative">
                      <input
                        id="bill-upload"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="bill-upload"
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl border border-slate-700/50 cursor-pointer block"
                      >
                        Choose File
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage 1-4: Audit Simulation Checklist */}
              {verificationStep > 0 && verificationStep < 5 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-center space-x-3 p-4 bg-slate-900 rounded-2xl border border-slate-850">
                    <Loader2 className="h-5 w-5 text-emerald-400 animate-spin" />
                    <span className="font-semibold text-slate-200 text-sm">AI Guardrails Auditing Document...</span>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Checklist Step 1 */}
                    <div className="flex items-start space-x-3 text-xs">
                      <div className="shrink-0 mt-0.5">
                        {verificationStep >= 2 ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500/10" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-800 animate-pulse bg-slate-900" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className={`font-bold block ${verificationStep >= 1 ? 'text-slate-200' : 'text-slate-500'}`}>
                          [🔍 Scanning File Metadata...]
                        </span>
                        {verificationStep >= 2 && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Passed: Original document verified (No editing software detected).
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Checklist Step 2 */}
                    <div className="flex items-start space-x-3 text-xs">
                      <div className="shrink-0 mt-0.5">
                        {verificationStep >= 3 ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500/10" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-800" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className={`font-bold block ${verificationStep >= 2 ? 'text-slate-200' : 'text-slate-500'}`}>
                          [🆔 Checking Account Duplication...]
                        </span>
                        {verificationStep >= 3 && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Passed: Unique Account Number registered.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Checklist Step 3 */}
                    <div className="flex items-start space-x-3 text-xs">
                      <div className="shrink-0 mt-0.5">
                        {verificationStep >= 4 ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500/10" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-800" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className={`font-bold block ${verificationStep >= 3 ? 'text-slate-200' : 'text-slate-500'}`}>
                          [📐 Analyzing Text Layout & Alignment...]
                        </span>
                        {verificationStep >= 4 && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Passed: No structural font/image tampering detected.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Checklist Step 4 */}
                    <div className="flex items-start space-x-3 text-xs">
                      <div className="shrink-0 mt-0.5">
                        {verificationStep >= 5 ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500/10" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-800" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className={`font-bold block ${verificationStep >= 4 ? 'text-slate-200' : 'text-slate-500'}`}>
                          [📊 Comparing Historical Baselines...]
                        </span>
                        {verificationStep >= 5 && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Passed: 45 kWh drop matches realistic consumption trends.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage 5: Success Breakdown */}
              {verificationStep === 5 && (
                <div className="space-y-6">
                  {verificationSuccess ? (
                    <>
                      <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                        <span className="text-4xl block animate-bounce">✅</span>
                        <h4 className="font-extrabold text-emerald-400 font-outfit">AI Verification Completed!</h4>
                        <p className="text-xs text-slate-400">The uploaded utility invoice has passed security and data authenticity checks.</p>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800 text-xs">
                        <div className="pb-3 flex justify-between">
                          <span className="text-slate-500 font-semibold">Extracted Account Name:</span>
                          <span className="font-bold text-slate-200 uppercase font-mono">
                            {members.find(m => m.id === verificationMemberId)?.name || 'Priya'}
                          </span>
                        </div>
                        <div className="py-3 flex justify-between">
                          <span className="text-slate-500 font-semibold">Usage Reduction:</span>
                          <span className="font-bold text-emerald-400 font-mono">45 kWh vs Last Month</span>
                        </div>
                        <div className="pt-3 flex justify-between">
                          <span className="text-slate-500 font-semibold">Status:</span>
                          <span className="font-bold text-emerald-400 font-mono flex items-center space-x-1">
                            <Check className="h-3 w-3" />
                            <span>VERIFIED</span>
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-semibold flex items-center justify-between">
                        <span>Bonus Reward:</span>
                        <span>✨ +1,000 Household points & Unlock Coupon</span>
                      </div>

                      <button
                        onClick={confirmVerificationSuccess}
                        className="w-full py-3.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-950 transition-all text-sm flex items-center justify-center space-x-2"
                      >
                        <span>Claim Voucher & Reset Account Status</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-2xl text-center space-y-2">
                        <span className="text-4xl block animate-bounce">❌</span>
                        <h4 className="font-extrabold text-rose-400 font-outfit">AI Verification Failed</h4>
                        <p className="text-xs text-rose-300">The uploaded utility invoice did not pass all security and authenticity criteria.</p>
                      </div>

                      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center text-sm font-semibold text-amber-400">
                        ❌ Verification Failed: Account name on the bill does not match the active family profile name.
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800 text-xs">
                        <div className="pb-3 flex justify-between">
                          <span className="text-slate-500 font-semibold">Active Profile:</span>
                          <span className="font-bold text-slate-200 uppercase font-mono">
                            {members.find(m => m.id === verificationMemberId)?.name || 'N/A'}
                          </span>
                        </div>
                        <div className="py-3 flex justify-between">
                          <span className="text-slate-500 font-semibold">Uploaded File Name:</span>
                          <span className="font-bold text-slate-200 font-mono break-all">{selectedFile?.name || 'Unknown'}</span>
                        </div>
                        <div className="pt-3 flex justify-between">
                          <span className="text-slate-550 font-semibold">Status:</span>
                          <span className="font-bold text-rose-400 font-mono">REJECTED</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setVerificationStep(0);
                          setSelectedFile(null);
                          setVerificationSuccess(false);
                        }}
                        className="w-full py-3.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all text-sm"
                      >
                        Try Again with Another File
                      </button>
                    </>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
      <ChatBotWidget members={members} activeMemberId={activeMemberId} monthlyStats={monthlyStats} />
    </div>
  );
}

export default App;

