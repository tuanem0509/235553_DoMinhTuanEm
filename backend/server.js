const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Employee = require('./models/Employee');

const app = express();
app.use(express.json());
app.use(cors());

// Kết nối MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// Endpoint kiểm tra trạng thái
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

// 1. Lấy danh sách nhân viên & Tìm kiếm (GET /api/employees?search=...)
app.get('/api/employees', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { employeeId: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const employees = await Employee.find(query);
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Lấy thông tin 1 nhân viên (GET /api/employees/:id)
app.get('/api/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id) || await Employee.findOne({ employeeId: req.params.id });
    if (!employee) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Thêm nhân viên mới (POST /api/employees)
app.post('/api/employees', async (req, res) => {
  try {
    const { employeeId, fullName, email } = req.body;
    if (!employeeId || !fullName || !email) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ employeeId, fullName và email' });
    }
    const existing = await Employee.findOne({ employeeId });
    if (existing) {
      return res.status(400).json({ message: 'Mã nhân viên đã tồn tại' });
    }
    const newEmployee = new Employee(req.body);
    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Cập nhật nhân viên (PUT /api/employees/:id)
app.put('/api/employees/:id', async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEmployee) return res.status(404).json({ message: 'Không tìm thấy nhân viên để cập nhật' });
    res.status(200).json(updatedEmployee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 5. Xóa nhân viên (DELETE /api/employees/:id)
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
    if (!deletedEmployee) return res.status(404).json({ message: 'Không tìm thấy nhân viên để xóa' });
    res.status(200).json({ message: 'Xóa nhân viên thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
