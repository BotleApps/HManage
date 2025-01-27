/*
  # Hospital Shift Management Schema

  1. New Tables
    - `staff`
      - `id` (uuid, primary key)
      - `name` (text)
      - `role` (text) - e.g., doctor, nurse, technician
      - `email` (text, unique)
      - `active` (boolean)
      - `created_at` (timestamp)
    
    - `shifts`
      - `id` (uuid, primary key)
      - `staff_id` (uuid, foreign key)
      - `shift_date` (date)
      - `shift_type` (text) - morning, afternoon, night
      - `created_at` (timestamp)
    
    - `attendance`
      - `id` (uuid, primary key)
      - `shift_id` (uuid, foreign key)
      - `check_in` (timestamp)
      - `check_out` (timestamp)
      - `status` (text) - present, absent, late
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create staff table
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  email text UNIQUE NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES staff(id),
  shift_date date NOT NULL,
  shift_type text NOT NULL CHECK (shift_type IN ('morning', 'afternoon', 'night')),
  created_at timestamptz DEFAULT now()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id uuid REFERENCES shifts(id),
  check_in timestamptz,
  check_out timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'present', 'absent', 'late')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Policies for staff table
CREATE POLICY "Staff can view all staff members"
  ON staff FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can update their own profile"
  ON staff FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policies for shifts table
CREATE POLICY "Staff can view all shifts"
  ON shifts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can view their own shifts"
  ON shifts FOR ALL
  TO authenticated
  USING (staff_id = auth.uid());

-- Policies for attendance table
CREATE POLICY "Staff can view all attendance records"
  ON attendance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can update their own attendance"
  ON attendance FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shifts
      WHERE shifts.id = attendance.shift_id
      AND shifts.staff_id = auth.uid()
    )
  );