import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Staff, Shift } from '../types';
import { format, startOfWeek, addDays } from 'date-fns';
import { Calendar, Plus } from 'lucide-react';

export default function ShiftSchedule() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newShift, setNewShift] = useState({
    staff_id: '',
    shift_date: format(new Date(), 'yyyy-MM-dd'),
    shift_type: 'morning'
  });

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  async function fetchData() {
    try {
      const startDate = startOfWeek(selectedDate);
      const dates = Array.from({ length: 7 }, (_, i) => format(addDays(startDate, i), 'yyyy-MM-dd'));
      
      const [shiftsResponse, staffResponse] = await Promise.all([
        supabase
          .from('shifts')
          .select('*, staff(*)')
          .in('shift_date', dates),
        supabase
          .from('staff')
          .select('*')
          .eq('active', true)
      ]);

      if (shiftsResponse.error) throw shiftsResponse.error;
      if (staffResponse.error) throw staffResponse.error;

      setShifts(shiftsResponse.data || []);
      setStaff(staffResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddShift(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('shifts')
        .insert([newShift]);
      
      if (error) throw error;
      
      setShowAddModal(false);
      setNewShift({
        staff_id: '',
        shift_date: format(new Date(), 'yyyy-MM-dd'),
        shift_type: 'morning'
      });
      fetchData();
    } catch (error) {
      console.error('Error adding shift:', error);
    }
  }

  const startDate = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-gray-500" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Shift Schedule
          </h3>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Shift
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shift
              </th>
              {weekDays.map((day) => (
                <th
                  key={day.toString()}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {format(day, 'EEE dd/MM')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {['morning', 'afternoon', 'night'].map((shiftType) => (
              <tr key={shiftType}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                  {shiftType}
                </td>
                {weekDays.map((day) => {
                  const dayShifts = shifts.filter(
                    (shift) =>
                      shift.shift_date === format(day, 'yyyy-MM-dd') &&
                      shift.shift_type === shiftType
                  );
                  return (
                    <td key={day.toString()} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dayShifts.map((shift) => (
                        <div key={shift.id} className="mb-1">
                          {shift.staff?.name}
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Add New Shift</h3>
            <form onSubmit={handleAddShift}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Staff Member</label>
                  <select
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={newShift.staff_id}
                    onChange={(e) => setNewShift({ ...newShift, staff_id: e.target.value })}
                  >
                    <option value="">Select staff member</option>
                    {staff.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={newShift.shift_date}
                    onChange={(e) => setNewShift({ ...newShift, shift_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Shift Type</label>
                  <select
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={newShift.shift_type}
                    onChange={(e) => setNewShift({ ...newShift, shift_type: e.target.value as any })}
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="night">Night</option>
                  </select>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 flex space-x-3">
                <button
                  type="submit"
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                >
                  Add Shift
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}