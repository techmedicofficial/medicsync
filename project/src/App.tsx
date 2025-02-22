import React, { useState } from 'react';
import { Activity, Users, Bed, PlusCircle } from 'lucide-react';
import PatientQueue from './components/PatientQueue';
import DoctorStatus from './components/DoctorStatus';
import EmergencyAlerts from './components/EmergencyAlerts';
import PatientCheckIn from './components/PatientCheckIn';

function App() {
  const [showCheckIn, setShowCheckIn] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">MEDI-Sync</h1>
            </div>
            <button
              onClick={() => setShowCheckIn(!showCheckIn)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              New Patient
            </button>
          </div>
        </div>
      </header>

      {/* Patient Check-in Modal */}
      {showCheckIn && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">New Patient Check-in</h2>
                <button
                  onClick={() => setShowCheckIn(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <PatientCheckIn />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {/* Patient Queue */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-500" />
                <h2 className="ml-2 text-lg font-medium text-gray-900">Patient Queue</h2>
              </div>
            </div>
            <PatientQueue />
          </div>

          {/* Doctor Status */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-gray-500" />
                <h2 className="ml-2 text-lg font-medium text-gray-900">Doctor Status</h2>
              </div>
            </div>
            <DoctorStatus />
          </div>

          {/* Emergency Alerts */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center">
                <Bed className="h-5 w-5 text-gray-500" />
                <h2 className="ml-2 text-lg font-medium text-gray-900">Emergency Alerts</h2>
              </div>
            </div>
            <EmergencyAlerts />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;