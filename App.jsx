import React, { useState } from 'react';
import { Home, DollarSign, TrendingUp, Calculator } from 'lucide-react';

export default function HomeValuationTool() {
  const [address, setAddress] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  // Lead capture form
  const [showLeadForm, setShowLeadForm] = useState(true);
  const [leadInfo, setLeadInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  
  const [propertyData, setPropertyData] = useState({
    sqft: '',
    bedrooms: '',
    bathrooms: '',
    lotSize: '',
    yearBuilt: '',
    condition: 'good',
    recentUpgrades: '',
    mortgagePayoff: ''
  });
  
  const [comparables, setComparables] = useState([
    { id: 1, address: '', soldPrice: '', sqft: '', soldDate: '' },
    { id: 2, address: '', soldPrice: '', sqft: '', soldDate: '' },
    { id: 3, address: '', soldPrice: '', sqft: '', soldDate: '' }
  ]);
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLeadFormSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!leadInfo.name || !leadInfo.phone || !leadInfo.email) {
      alert('Please fill out all fields');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leadInfo.email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    // Here you would send the lead info to your CRM or database
    console.log('Lead captured:', leadInfo);
    
    // Hide the form and show the valuation tool
    setShowLeadForm(false);
  };

  const fetchAddressSuggestions = async (input) => {
    if (input.length < 2) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    // In production, replace with Google Places Autocomplete API
    // This mock version generates more realistic suggestions based on what user types
    
    // Parse what the user has typed so far
    const inputLower = input.toLowerCase();
    
    // Generate suggestions that include what they've typed
    const streetTypes = ['Street', 'Avenue', 'Drive', 'Lane', 'Way', 'Court', 'Place', 'Road', 'Boulevard'];
    const cities = [
      { name: 'San Diego', zip: '92101' },
      { name: 'Del Mar', zip: '92014' },
      { name: 'La Jolla', zip: '92037' },
      { name: 'Encinitas', zip: '92024' },
      { name: 'Carlsbad', zip: '92008' },
      { name: 'Solana Beach', zip: '92075' }
    ];
    
    const mockSuggestions = [];
    
    // If user has typed a number, suggest addresses starting with that number
    const numberMatch = input.match(/^(\d+)/);
    if (numberMatch) {
      const baseNumber = numberMatch[1];
      const restOfInput = input.substring(baseNumber.length).trim();
      
      if (restOfInput.length > 0) {
        // They've started typing the street name
        streetTypes.forEach(type => {
          cities.slice(0, 3).forEach(city => {
            mockSuggestions.push(`${baseNumber} ${restOfInput.charAt(0).toUpperCase() + restOfInput.slice(1)} ${type}, ${city.name}, CA ${city.zip}`);
          });
        });
      } else {
        // Just the number so far
        streetTypes.slice(0, 3).forEach((type, idx) => {
          const city = cities[idx % cities.length];
          mockSuggestions.push(`${baseNumber} Main ${type}, ${city.name}, CA ${city.zip}`);
          mockSuggestions.push(`${baseNumber} Oak ${type}, ${city.name}, CA ${city.zip}`);
        });
      }
    } else {
      // No number yet, suggest based on what they've typed
      streetTypes.forEach((type, idx) => {
        const city = cities[idx % cities.length];
        const streetName = input.charAt(0).toUpperCase() + input.slice(1);
        mockSuggestions.push(`123 ${streetName} ${type}, ${city.name}, CA ${city.zip}`);
        mockSuggestions.push(`456 ${streetName} ${type}, ${city.name}, CA ${city.zip}`);
      });
    }
    
    // Limit to 6 suggestions
    setAddressSuggestions(mockSuggestions.slice(0, 6));
    setShowSuggestions(true);
  };

  const handleAddressChange = (value) => {
    setAddress(value);
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout for debouncing (wait 300ms after user stops typing)
    const timeout = setTimeout(() => {
      fetchAddressSuggestions(value);
    }, 300);
    
    setTypingTimeout(timeout);
  };

  const selectAddress = (selectedAddress) => {
    setAddress(selectedAddress);
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  const fetchPropertyData = async () => {
    if (!address) return;
    
    setLoading(true);
    
    // Simulate API call - in production, you'd call Redfin/Zillow API or scraping service
    // This would also fetch comparable sales automatically
    setTimeout(() => {
      // Mock property data
      setPropertyData({
        sqft: '2400',
        bedrooms: '4',
        bathrooms: '2.5',
        lotSize: '7500',
        yearBuilt: '1998',
        condition: 'good',
        recentUpgrades: 'Updated kitchen (2022), New roof (2021)',
        mortgagePayoff: ''
      });
      
      // Mock comparable sales - automatically populated
      setComparables([
        { 
          id: 1, 
          address: '456 Oak Avenue, San Diego, CA', 
          soldPrice: '725000', 
          sqft: '2350', 
          soldDate: '11/2025' 
        },
        { 
          id: 2, 
          address: '789 Maple Street, San Diego, CA', 
          soldPrice: '695000', 
          sqft: '2280', 
          soldDate: '12/2025' 
        },
        { 
          id: 3, 
          address: '321 Pine Lane, San Diego, CA', 
          soldPrice: '740000', 
          sqft: '2500', 
          soldDate: '10/2025' 
        }
      ]);
      
      setLoading(false);
    }, 1500);
  };

  const calculateValuation = () => {
    // Calculate average price per sqft from comparables
    const validComps = comparables.filter(c => c.soldPrice && c.sqft);
    
    if (validComps.length === 0 || !propertyData.sqft) {
      alert('Please enter at least one comparable sale and property square footage');
      return;
    }
    
    const avgPricePerSqft = validComps.reduce((sum, comp) => {
      return sum + (parseFloat(comp.soldPrice) / parseFloat(comp.sqft));
    }, 0) / validComps.length;
    
    const subjectSqft = parseFloat(propertyData.sqft);
    const baseValue = avgPricePerSqft * subjectSqft;
    
    // Condition adjustments
    const conditionAdjustments = {
      excellent: 1.10,
      good: 1.0,
      average: 0.95,
      fair: 0.88,
      poor: 0.80
    };
    
    const adjustedValue = baseValue * conditionAdjustments[propertyData.condition];
    
    // Calculate equity
    const mortgagePayoff = parseFloat(propertyData.mortgagePayoff) || 0;
    const equity = adjustedValue - mortgagePayoff;
    const equityPercentage = mortgagePayoff > 0 ? (equity / adjustedValue) * 100 : 100;
    
    setResults({
      estimatedValue: adjustedValue,
      pricePerSqft: avgPricePerSqft,
      valueRange: {
        low: adjustedValue * 0.95,
        high: adjustedValue * 1.05
      },
      equity: equity,
      equityPercentage: equityPercentage,
      mortgagePayoff: mortgagePayoff
    });
  };

  const updateComparable = (id, field, value) => {
    setComparables(comparables.map(comp => 
      comp.id === id ? { ...comp, [field]: value } : comp
    ));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="mb-6">
            <h3 className="text-2xl font-light tracking-widest text-lime-400 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              OVERCREST REALTY
            </h3>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-lime-400 to-transparent mx-auto"></div>
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Home className="w-12 h-12 text-lime-400" strokeWidth={1.5} />
            <h1 className="text-5xl font-light tracking-tight">Home Valuation</h1>
          </div>
          <p className="text-emerald-200 text-lg font-light">
            Discover your property's market value and equity position
          </p>
        </div>

        {/* Lead Capture Form */}
        {showLeadForm ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
              <h2 className="text-3xl font-light mb-3 text-center">Get Your Free Home Valuation</h2>
              <p className="text-emerald-200 text-center mb-8 font-light">
                Enter your information to access our instant valuation tool
              </p>
              
              <form onSubmit={handleLeadFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-emerald-200 mb-2 text-sm font-light">Full Name *</label>
                  <input
                    type="text"
                    placeholder="John Smith"
                    value={leadInfo.name}
                    onChange={(e) => setLeadInfo({...leadInfo, name: e.target.value})}
                    className="w-full px-6 py-4 bg-emerald-950/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400/50 text-white placeholder-emerald-300/50 font-light"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-emerald-200 mb-2 text-sm font-light">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="(619) 555-0123"
                    value={leadInfo.phone}
                    onChange={(e) => setLeadInfo({...leadInfo, phone: e.target.value})}
                    className="w-full px-6 py-4 bg-emerald-950/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400/50 text-white placeholder-emerald-300/50 font-light"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-emerald-200 mb-2 text-sm font-light">Email Address *</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={leadInfo.email}
                    onChange={(e) => setLeadInfo({...leadInfo, email: e.target.value})}
                    className="w-full px-6 py-4 bg-emerald-950/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400/50 text-white placeholder-emerald-300/50 font-light"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full px-8 py-5 bg-gradient-to-r from-lime-400 to-lime-500 text-emerald-900 rounded-xl text-lg font-semibold hover:from-lime-300 hover:to-lime-400 transition-all shadow-lg hover:shadow-lime-400/25"
                >
                  Continue to Valuation Tool
                </button>
                
                <p className="text-emerald-200/70 text-xs text-center font-light">
                  By continuing, you agree to receive communications from Overcrest Realty about your property valuation and related services.
                </p>
              </form>
            </div>
          </div>
        ) : (
          <>
            {/* Address Lookup */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-light mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-lime-400/20 flex items-center justify-center text-lime-400 text-sm">1</span>
            Property Address
          </h2>
          <div className="relative">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Enter your full address (e.g., 123 Main St, San Diego, CA 92101)"
                  value={address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  onFocus={() => address.length >= 2 && fetchAddressSuggestions(address)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && address.length > 5) {
                      setShowSuggestions(false);
                      fetchPropertyData();
                    }
                  }}
                  className="w-full px-6 py-4 bg-emerald-950/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400/50 text-white placeholder-emerald-300/50 font-light"
                />
                
                {/* Autocomplete Dropdown */}
                {showSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-emerald-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-6 py-3 bg-lime-400/10 border-b border-white/10">
                      <p className="text-xs text-emerald-200 font-light">Suggestions (or just type your full address)</p>
                    </div>
                    {addressSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => selectAddress(suggestion)}
                        className="w-full text-left px-6 py-4 hover:bg-lime-400/20 transition-colors border-b border-white/10 last:border-0 text-white font-light"
                      >
                        <div className="flex items-center gap-3">
                          <Home className="w-4 h-4 text-lime-400 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={fetchPropertyData}
                disabled={loading || !address}
                className="px-8 py-4 bg-gradient-to-r from-lime-400 to-lime-500 text-emerald-900 rounded-xl font-semibold hover:from-lime-300 hover:to-lime-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-lime-400/25"
              >
                {loading ? 'Loading...' : 'Get Valuation'}
              </button>
            </div>
          </div>
          <p className="text-emerald-200/70 text-sm mt-3 font-light">
            Type or paste your complete address, then click "Get Valuation" (autocomplete suggestions are optional)
          </p>
        </div>

        {/* Property Details - Auto-populated, editable */}
        {propertyData.sqft && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-light mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-lime-400/20 flex items-center justify-center text-lime-400 text-sm">2</span>
              Property Details
              <span className="text-sm text-emerald-200 font-light ml-auto">(Review and adjust if needed)</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-emerald-200 mb-2 text-sm font-light">Square Feet</label>
                <input
                  type="number"
                  placeholder="2400"
                  value={propertyData.sqft}
                  onChange={(e) => setPropertyData({...propertyData, sqft: e.target.value})}
                  className="w-full px-4 py-3 bg-emerald-950/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400/50 text-white font-light"
                />
              </div>
              
              <div>
                <label className="block text-emerald-200 mb-2 text-sm font-light">Bedrooms</label>
                <input
                  type="number"
                  placeholder="4"
                  value={propertyData.bedrooms}
                  onChange={(e) => setPropertyData({...propertyData, bedrooms: e.target.value})}
                  className="w-full px-4 py-3 bg-emerald-950/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400/50 text-white font-light"
                />
              </div>
              
              <div>
                <label className="block text-emerald-200 mb-2 text-sm font-light">Bathrooms</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="2.5"
                  value={propertyData.bathrooms}
                  onChange={(e) => setPropertyData({...propertyData, bathrooms: e.target.value})}
                  className="w-full px-4 py-3 bg-emerald-950/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400/50 text-white font-light"
                />
              </div>
              
              <div>
                <label className="block text-emerald-200 mb-2 text-sm font-light">Lot Size (sq ft)</label>
                <input
                  type="number"
                  placeholder="7500"
                  value={propertyData.lotSize}
                  onChange={(e) => setPropertyData({...propertyData, lotSize: e.target.value})}
                  className="w-full px-4 py-3 bg-emerald-950/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400/50 text-white font-light"
                />
              </div>
              
              <div>
                <label className="block text-emerald-200 mb-2 text-sm font-light">Year Built</label>
                <input
                  type="number"
                  placeholder="1998"
                  value={propertyData.yearBuilt}
                  onChange={(e) => setPropertyData({...propertyData, yearBuilt: e.target.value})}
                  className="w-full px-4 py-3 bg-emerald-950/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400/50 text-white font-light"
                />
              </div>
              
              <div>
                <label className="block text-emerald-200 mb-2 text-sm font-light">Condition</label>
                <select
                  value={propertyData.condition}
                  onChange={(e) => setPropertyData({...propertyData, condition: e.target.value})}
                  className="w-full px-4 py-3 bg-emerald-950/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400/50 text-white font-light"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="average">Average</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-emerald-200 mb-2 text-sm font-light">Recent Upgrades</label>
              <textarea
                placeholder="Updated kitchen (2022), New roof (2021), etc."
                value={propertyData.recentUpgrades}
                onChange={(e) => setPropertyData({...propertyData, recentUpgrades: e.target.value})}
                className="w-full px-4 py-3 bg-emerald-950/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400/50 text-white font-light"
                rows="3"
              />
            </div>
            
            <div>
              <label className="block text-emerald-200 mb-2 text-sm font-light">Current Mortgage Payoff Amount (Optional)</label>
              <input
                type="number"
                placeholder="250000"
                value={propertyData.mortgagePayoff}
                onChange={(e) => setPropertyData({...propertyData, mortgagePayoff: e.target.value})}
                className="w-full px-4 py-3 bg-emerald-950/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400/50 text-white font-light"
              />
              <p className="text-emerald-200/70 text-xs mt-2 font-light">Enter to see your equity position</p>
            </div>
          </div>
        )}

        {/* Comparable Sales - Now auto-populated */}
        {comparables.some(c => c.soldPrice) && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-light mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-lime-400/20 flex items-center justify-center text-lime-400 text-sm">3</span>
              Comparable Sales Analysis
            </h2>
            <p className="text-emerald-200 mb-6 font-light">Recent comparable sales found in your area:</p>
            
            {comparables.filter(c => c.soldPrice).map((comp, index) => (
              <div key={comp.id} className="mb-4 p-5 bg-emerald-950/30 rounded-xl border border-white/10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-emerald-300/70 mb-1">Address</div>
                    <div className="font-light">{comp.address}</div>
                  </div>
                  <div>
                    <div className="text-emerald-300/70 mb-1">Sold Price</div>
                    <div className="font-light text-lime-400">{formatCurrency(comp.soldPrice)}</div>
                  </div>
                  <div>
                    <div className="text-emerald-300/70 mb-1">Size</div>
                    <div className="font-light">{comp.sqft} sq ft</div>
                  </div>
                  <div>
                    <div className="text-emerald-300/70 mb-1">Sold Date</div>
                    <div className="font-light">{comp.soldDate}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calculate Button */}
        {propertyData.sqft && comparables.some(c => c.soldPrice) && (
          <div className="flex justify-center mb-8">
            <button
              onClick={calculateValuation}
              className="px-12 py-5 bg-gradient-to-r from-lime-400 to-lime-500 text-emerald-900 rounded-xl text-lg font-semibold hover:from-lime-300 hover:to-lime-400 transition-all shadow-2xl hover:shadow-lime-400/25 flex items-center gap-3"
            >
              <Calculator className="w-6 h-6" />
              Calculate Home Value
            </button>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="bg-gradient-to-br from-lime-500/10 to-lime-600/5 backdrop-blur-sm rounded-2xl p-8 border border-lime-500/20 shadow-2xl">
            <h2 className="text-3xl font-light mb-8 text-center flex items-center justify-center gap-3">
              <TrendingUp className="w-8 h-8 text-lime-400" />
              Valuation Results
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-emerald-950/50 rounded-xl p-6 border border-white/10">
                <div className="text-emerald-200 text-sm font-light mb-2">Estimated Market Value</div>
                <div className="text-4xl font-light text-lime-400">{formatCurrency(results.estimatedValue)}</div>
                <div className="text-emerald-300/70 text-sm mt-2 font-light">
                  Range: {formatCurrency(results.valueRange.low)} - {formatCurrency(results.valueRange.high)}
                </div>
              </div>
              
              <div className="bg-emerald-950/50 rounded-xl p-6 border border-white/10">
                <div className="text-emerald-200 text-sm font-light mb-2">Price Per Square Foot</div>
                <div className="text-4xl font-light text-lime-400">{formatCurrency(results.pricePerSqft)}</div>
                <div className="text-emerald-300/70 text-sm mt-2 font-light">
                  Based on {comparables.filter(c => c.soldPrice && c.sqft).length} comparables
                </div>
              </div>
            </div>
            
            {results.mortgagePayoff > 0 && (
              <div className="bg-emerald-950/50 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-light mb-6 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-lime-400" />
                  Equity Analysis
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-emerald-200 text-sm font-light mb-2">Estimated Value</div>
                    <div className="text-2xl font-light text-white">{formatCurrency(results.estimatedValue)}</div>
                  </div>
                  
                  <div>
                    <div className="text-emerald-200 text-sm font-light mb-2">Mortgage Payoff</div>
                    <div className="text-2xl font-light text-red-400">-{formatCurrency(results.mortgagePayoff)}</div>
                  </div>
                  
                  <div>
                    <div className="text-emerald-200 text-sm font-light mb-2">Your Equity</div>
                    <div className="text-2xl font-light text-lime-400">{formatCurrency(results.equity)}</div>
                    <div className="text-emerald-300/70 text-sm mt-1 font-light">
                      {results.equityPercentage.toFixed(1)}% equity
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-emerald-200 font-light">Equity Position</span>
                    <span className="text-white font-light">{results.equityPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-emerald-950 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-lime-400 to-lime-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(results.equityPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 p-6 bg-emerald-950/30 rounded-xl border border-white/10">
              <p className="text-emerald-200/80 text-sm font-light leading-relaxed">
                <strong className="text-white">Disclaimer:</strong> This valuation is an estimate based on comparable market analysis and should not be considered a formal appraisal. 
                Actual market value may vary based on current market conditions, specific property features, and buyer demand. 
                For a precise valuation, consult with a licensed real estate professional or certified appraiser.
              </p>
            </div>
            
            {/* Call to Action */}
            <div className="mt-6 bg-gradient-to-r from-lime-400/20 to-lime-500/10 backdrop-blur-sm rounded-2xl p-8 border border-lime-400/30 shadow-xl text-center">
              <h3 className="text-2xl font-light mb-3 text-white">Interested in Selling?</h3>
              <p className="text-emerald-200 mb-6 font-light">
                Get a professional consultation and personalized market strategy
              </p>
              <a
                href="tel:+16192889363"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-lime-400 to-lime-500 text-emerald-900 rounded-xl text-lg font-semibold hover:from-lime-300 hover:to-lime-400 transition-all shadow-lg hover:shadow-lime-400/25"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Overcrest Realty
              </a>
              <p className="text-emerald-200/70 text-sm mt-4 font-light">
                (619) 288-9363
              </p>
            </div>
          </div>
        )}
      </>
        )}
      </div>
    </div>
  );
}