import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Attendance as AttendanceType } from '../types';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function Attendance() {
  const [attendance, setAttendance] = useState<AttendanceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  async function fetchAttendance() {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          shift:shifts (
            *,
            staff:staff (*)
          )
        `)
        .eq('shift.shift_date', selectedDate);
      
      if (error) throw error;
      setAttendance(data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateAttendanceStatus(id: string, status: string) {
    try {
      const { error } = await supabase
        .from('attendance')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      fetchAttendance();
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  }

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Attendance Record</h3>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {attendance.map((record) => (
            <li key={record.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {record.shift?.staff?.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {record.shift?.shift_type} Shift
                  </p>
                  {record.check_in && (
                    <p className="text-sm text-gray-500">
                      Check-in: {format(new Date(record.check_in), 'HH:mm')}
                    </p>
                  )}
                  {record.check_out && (
                    <p className="text-sm text-gray-500">
                      Check-out: {format(new Date(record.check_out), 'HH:mm')}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateAttendanceStatus(record.id, 'present')}
                    className={`p-2 rounded-full ${
                      record.status === 'present'
                        ? 'bg-green-100 text-green-600'
                        : 'hover:bg-green-100 text-gray-400'
                    }`}
                  >
                    <CheckCircle className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => updateAttendanceStatus(record.id, 'late')}
                    className={`p-2 rounded-full ${
                      record.status === 'late'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'hover:bg-yellow-100 text-gray-400'
                    }`}
                  >
                    <Clock className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => updateAttendanceStatus(record.id, 'absent')}
                    className={`p-2 rounded-full ${
                      record.status === 'absent'
                        ? 'bg-red-100 text-red-600'
                        : 'hover:bg-red-100 text-gray-400'
                    }`}
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}