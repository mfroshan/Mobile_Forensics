'use client';
import { useState } from 'react';
import { Shield, Upload, FileText, Mail, Globe, AlertTriangle, CheckCircle, XCircle, Zap, Eye, Lock, Activity, Search } from 'lucide-react';

// YARA Rule Sets for scanning simulation
const YARA_RULE_SETS = [
  { name: 'Malware Signatures', description: 'Scanning for known malware patterns', color: 'text-red-400' },
  { name: 'Suspicious Network Activity', description: 'Analyzing network communications', color: 'text-orange-400' },
  { name: 'Phishing & Social Engineering', description: 'Detecting phishing attempts', color: 'text-yellow-400' },
  { name: 'Cryptocurrency Miners', description: 'Checking for hidden mining code', color: 'text-purple-400' },
  { name: 'System File Integrity', description: 'Verifying system file authenticity', color: 'text-blue-400' }
];

// Mock service for demonstration
const uploadScan = async (file, onProgress) => {
  onProgress({ currentRule: 0, progress: 10, scanning: true });

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:4000/scan', { // use your backend port
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  onProgress({ currentRule: -1, progress: 100, scanning: false });
  console.log(data)

  // Format and return results as needed
  return [data];
};

export default function Scanner() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState([]);
  const [scanProgress, setScanProgress] = useState({
    currentRule: -1,
    progress: 0,
    scanning: false
  });

  const handleUpload = async () => {
    if (!file) return;
    
    try {
      const res = await uploadScan(file, setScanProgress);
      setResult(Array.isArray(res) ? res : [res]);
    } catch (error) {
      console.error('Scan failed:', error);
    }
  };

  // const safeParse = (val, fallback) => {
  //   if (!val) return fallback;
  //   try {
  //     const parsed = JSON.parse(val);
  //     // If parsed is an array (like "[]"), return fallback object
  //     if (Array.isArray(parsed)) return fallback;
  //     return parsed;
  //   } catch {
  //     return fallback;
  //   }
  // };
  const safeParse = (val, fallback) => {
    if (!val) return fallback;
    try {
      const parsed = JSON.parse(val);
      // Accept arrays and objects both
      if (typeof parsed === 'object') return parsed;
      return fallback;
    } catch {
      return fallback;
    }
  };

  const parsedResults = result.map(item => ({
    ...item,
    yaraMatches: safeParse(item.yaraMatches, { emails: [], ips: [] }),
    regexMatches: safeParse(item.regexMatches, { patterns: [] }),
    scanStats: item.scanStats || { totalRules: 0, matchedRules: 0, scanDuration: '00:00:00' }
  }));

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'border-red-500 bg-red-900/20';
      case 'medium': return 'border-yellow-500 bg-yellow-900/20';
      case 'low': return 'border-green-500 bg-green-900/20';
      default: return 'border-gray-600 bg-gray-800/50';
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'low': return <CheckCircle className="w-5 h-5 text-green-400" />;
      default: return <Shield className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTotalMatches = (item) => {
    const yaraMatches = safeParse(item.yaraMatches, {});
    const regexMatches = safeParse(item.regexMatches, {});
    const scanStats = item.scanStats || {};
    return (
      (yaraMatches.emails?.length || 0) +
      (yaraMatches.ips?.length || 0) +
      (regexMatches.patterns?.length || 0) +
      (scanStats.matchedRules || 0)
    );
  };



  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-cyan-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">Forensics Mobile</h1>
          </div>
          <p className="text-gray-400">Advanced Malware Detection System</p>
        </div>

        {/* Upload Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select File for Analysis
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-300 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:bg-cyan-600 file:text-white"
              />
              <button
                onClick={handleUpload}
                disabled={!file || scanProgress.scanning}
                className="bg-cyan-600 hover:bg-cyan-700 px-6 py-2 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {scanProgress.scanning ? 'Scanning...' : 'Start Scan'}
              </button>
            </div>
          </div>

          {file && (
            <div className="text-sm text-gray-400 bg-gray-700 px-3 py-2 rounded">
              <FileText className="w-4 h-4 inline mr-2" />
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        {/* Scanning Progress */}
        {scanProgress.scanning && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <Activity className="w-6 h-6 text-cyan-400 mr-3 animate-pulse" />
              <h3 className="text-xl font-semibold">YARA Rule Scanning in Progress</h3>
            </div>

            {/* Overall Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Overall Progress</span>
                <span>{scanProgress.progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-cyan-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Rule Sets Progress */}
            <div className="space-y-3">
              {YARA_RULE_SETS.map((ruleSet, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-6 h-6 flex items-center justify-center">
                    {index < scanProgress.currentRule ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : index === scanProgress.currentRule ? (
                      <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-600 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${index <= scanProgress.currentRule ? ruleSet.color : 'text-gray-500'}`}>
                      {ruleSet.name}
                    </div>
                    <div className="text-sm text-gray-500">{ruleSet.description}</div>
                  </div>
                  <div className="text-sm text-gray-400 min-w-[80px] text-right">
                    {index < scanProgress.currentRule ? 'Complete' : 
                     index === scanProgress.currentRule ? 'Scanning...' : 'Pending'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

       {/* Result section */}
        {parsedResults.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center">
              <Search className="w-6 h-6 mr-3 text-cyan-400" />
              Scan Results
            </h2>
            
            {parsedResults.map((item) => (
              <div key={item.id} className={`bg-gray-800 rounded-lg border-l-4 overflow-hidden ${getRiskColor(item.riskLevel)}`}>
                <div className="p-6">
                  {/* File Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-gray-400" />
                      <div>
                        <h3 className="text-xl font-bold">{item.filename}</h3>
                        <p className="text-sm text-gray-400">
                          Scanned: {new Date(item.uploadedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${getRiskColor(item.riskLevel)}`}>
                      {getRiskIcon(item.riskLevel)}
                      <span className="font-bold uppercase text-sm">
                        {item.riskLevel} Risk
                      </span>
                    </div>
                  </div>

                  {/* Scan Statistics */}
                  <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div className="bg-gray-700 rounded p-3">
                      <div className="text-2xl font-bold text-cyan-400">{item.scanStats.totalRules}</div>
                      <div className="text-sm text-gray-400">Rules Scanned</div>
                    </div>
                    <div className="bg-gray-700 rounded p-3">
                      <div className="text-2xl font-bold text-yellow-400">{ getTotalMatches(item.scanStats.matchedRules)}</div>
                      <div className="text-sm text-gray-400">Matches Found</div>
                    </div>
                    <div className="bg-gray-700 rounded p-3">
                      <div className="text-2xl font-bold text-green-400">{item.scanStats.scanDuration}</div>
                      <div className="text-sm text-gray-400">Scan Time</div>
                    </div>
                  </div>

                  {/* Threat Details */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Email Threats */}
                    {/* <div className="bg-gray-700 rounded p-4">
                      <h4 className="font-bold text-red-400 mb-3 flex items-center">
                        <Mail className="w-5 h-5 mr-2" />
                        Suspicious Emails ({item.yaraMatches.emails?.length || 0})
                      </h4>
                      {item.yaraMatches.emails?.length > 0 ? (
                        <div className="space-y-2">
                          {item.yaraMatches.emails.map((email, idx) => (
                            <div key={`email-${idx}`} className="bg-red-900/20 border border-red-500/30 px-3 py-2 rounded text-sm text-red-300">
                              {email}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-green-400 text-sm">No threats detected</p>
                      )}
                    </div> */}
                  {/* Email Threats */}
                  <div className="bg-gray-700 rounded p-4">
                    <h4 className="font-bold text-red-400 mb-3 flex items-center">
                      <Mail className="w-5 h-5 mr-2" />
                      Suspicious Emails ({item.regexMatches.emails?.length || 0})
                    </h4>
                    {item.regexMatches.emails?.length > 0 ? (
                      <div className="space-y-2">
                        {item.regexMatches.emails.map((email, idx) => (
                          <div key={`email-${idx}`} className="bg-red-900/20 border border-red-500/30 px-3 py-2 rounded text-sm text-red-300">
                            {email}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-green-400 text-sm">No threats detected</p>
                    )}
                  </div>
                    {/* IP Threats */}
                    {/* <div className="bg-gray-700 rounded p-4">
                      <h4 className="font-bold text-orange-400 mb-3 flex items-center">
                        <Globe className="w-5 h-5 mr-2" />
                        Suspicious IPs ({item.yaraMatches.ips?.length || 0})
                      </h4>
                      {item.yaraMatches.ips?.length > 0 ? (
                        <div className="space-y-2">
                          {item.yaraMatches.ips.map((ip, idx) => (
                            <div key={`ip-${idx}`} className="bg-orange-900/20 border border-orange-500/30 px-3 py-2 rounded text-sm text-orange-300">
                              {ip}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-green-400 text-sm">No threats detected</p>
                      )}
                    </div> */}

              {/* IP Threats */}
              <div className="bg-gray-700 rounded p-4">
                <h4 className="font-bold text-orange-400 mb-3 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Suspicious IPs ({item.regexMatches.ips?.length || 0})
                </h4>
                {item.regexMatches.ips?.length > 0 ? (
                  <div className="space-y-2">
                    {item.regexMatches.ips.map((ip, idx) => (
                      <div key={`ip-${idx}`} className="bg-orange-900/20 border border-orange-500/30 px-3 py-2 rounded text-sm text-orange-300">
                        {ip}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-green-400 text-sm">No threats detected</p>
                )}
              </div>

                  
              {/* Ransomware Keywords */}
                  {item.regexMatches.ransomware_keywords && item.regexMatches.ransomware_keywords.length > 0 && (
                    <div className="bg-yellow-700 rounded p-3 mb-4">
                      <h4 className="font-bold text-yellow-400 mb-2">Ransomware Keywords Detected</h4>
                      <ul className="list-disc list-inside text-yellow-300">
                        {item.regexMatches.ransomware_keywords.map((keyword, i) => (
                          <li key={i}>{keyword}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Heuristic Details */}
                  {item.regexMatches.heuristics && (
                    <div className="bg-gray-700 rounded p-3 mb-4">
                      <h4 className="font-bold text-yellow-400 mb-2">File Analysis</h4>
                      {item.regexMatches.heuristics.high_entropy_strings?.length > 0 && (
                        <p>High Entropy Strings: {item.regexMatches.heuristics.high_entropy_strings.join(', ')}</p>
                      )}
                      {item.regexMatches.heuristics.suspicious_combinations?.length > 0 && (
                        <p>Suspicious Combinations: {item.regexMatches.heuristics.suspicious_combinations.join(', ')}</p>
                      )}
                    </div>
                  )}
                  {/* Malware Patterns */}
                  {item.regexMatches.patterns?.length > 0 && (
                    <div className="bg-gray-700 rounded p-3 mb-4">
                      <h4 className="font-bold text-yellow-400 mb-3 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Malware Patterns Detected
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {item.regexMatches.patterns.map((pattern, idx) => (
                          <span
                            key={`pattern-${idx}`}
                            className="bg-yellow-900/30 border border-yellow-500/50 text-yellow-300 px-3 py-1 rounded-full text-sm"
                          >
                            {pattern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              </div>
            ))}
          </div>
          
        )}

        {/* Idle State */}
        {!scanProgress.scanning && parsedResults.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">System Ready - Upload a file to begin analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}