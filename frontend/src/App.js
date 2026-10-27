import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    gender: 'Nam',
    dateOfBirth: '',
    department: '',
    position: '',
    email: '',
    phone: '',
    hireDate: '',
    status: 'Dang lam viec'
  });
  const [editingId, setEditingId] = useState(null);

  // Lấy danh sách nhân viên & Tìm kiếm
  const fetchEmployees = async (keyword = '') => {
    setLoading(true);
    setError('');
    try {
      const url = keyword ? `${API_URL}/employees?search=${keyword}` : `${API_URL}/employees`;
      const res = await axios.get(url);
      setEmployees(res.data);
    } catch (err) {
      setError('Lỗi khi tải danh sách nhân viên từ server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchEmployees(val);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Thêm hoặc Cập nhật nhân viên
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingId) {
        await axios.put(`${API_URL}/employees/${editingId}`, formData);
        setSuccess('Cập nhật thông tin nhân viên thành công!');
      } else {
        await axios.post(`${API_URL}/employees`, formData);
        setSuccess('Thêm nhân viên mới thành công!');
      }
      setFormData({
        employeeId: '', fullName: '', gender: 'Nam', dateOfBirth: '',
        department: '', position: '', email: '', phone: '', hireDate: '', status: 'Dang lam viec'
      });
      setEditingId(null);
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu.');
    }
  };

  // Đưa dữ liệu lên form để sửa
  const handleEdit = (emp) => {
    setEditingId(emp._id);
    setFormData(emp);
  };

  // Xóa nhân viên có hộp thoại xác nhận
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này không?')) {
      setError('');
      setSuccess('');
      try {
        await axios.delete(`${API_URL}/employees/${id}`);
        setSuccess('Xóa nhân viên thành công!');
        fetchEmployees();
      } catch (err) {
        setError('Không thể xóa nhân viên.');
      }
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <h2 className="text-center mb-4">HỆ THỐNG QUẢN LÝ NHÂN SỰ</h2>

      {/* Hiển thị thông báo */}
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Form Thêm / Sửa nhân viên */}
      <div className="card p-4 mb-4 shadow-sm">
        <h4>{editingId ? 'Cập nhật thông tin nhân viên' : 'Thêm hồ sơ nhân viên mới'}</h4>
        <form onSubmit={handleSubmit} className="row g-3 mt-2">
          <div className="col-md-3">
            <input type="text" className="form-control" name="employeeId" placeholder="Mã NV *" value={formData.employeeId} onChange={handleInputChange} required disabled={editingId} />
          </div>
          <div className="col-md-3">
            <input type="text" className="form-control" name="fullName" placeholder="Họ và tên *" value={formData.fullName} onChange={handleInputChange} required />
          </div>
          <div className="col-md-3">
            <select className="form-select" name="gender" value={formData.gender} onChange={handleInputChange}>
              <option value="Nam">Nam</option>
              <option value="Nu">Nữ</option>
            </select>
          </div>
          <div className="col-md-3">
            <input type="date" className="form-control" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} />
          </div>
          <div className="col-md-3">
            <input type="text" className="form-control" name="department" placeholder="Phòng ban" value={formData.department} onChange={handleInputChange} />
          </div>
          <div className="col-md-3">
            <input type="text" className="form-control" name="position" placeholder="Chức vụ" value={formData.position} onChange={handleInputChange} />
          </div>
          <div className="col-md-3">
            <input type="email" className="form-control" name="email" placeholder="Email *" value={formData.email} onChange={handleInputChange} required />
          </div>
          <div className="col-md-3">
            <input type="text" className="form-control" name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleInputChange} />
          </div>
          <div className="col-md-3">
            <input type="date" className="form-control" name="hireDate" value={formData.hireDate} onChange={handleInputChange} />
          </div>
          <div className="col-md-3">
            <input type="text" className="form-control" name="status" placeholder="Trạng thái làm việc" value={formData.status} onChange={handleInputChange} />
          </div>
          <div className="col-12 mt-3">
            <button type="submit" className="btn btn-primary me-2">{editingId ? 'Cập nhật' : 'Thêm mới'}</button>
            {editingId && <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setFormData({ employeeId: '', fullName: '', gender: 'Nam', dateOfBirth: '', department: '', position: '', email: '', phone: '', hireDate: '', status: 'Dang lam viec' }); }}>Hủy</button>}
          </div>
        </form>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="input-group mb-3">
        <input type="text" className="form-control" placeholder="Tìm kiếm theo mã nhân viên hoặc họ tên..." value={search} onChange={handleSearchChange} />
      </div>

      {/* Danh sách nhân viên */}
      <h4>Danh sách nhân viên</h4>
      {loading ? <p>Đang tải dữ liệu...</p> : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle">
            <thead className="table-dark">
              <tr>
                <th>Mã NV</th>
                <th>Họ tên</th>
                <th>Phòng ban</th>
                <th>Chức vụ</th>
                <th>Email</th>
                <th>Điện thoại</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan="8" className="text-center">Không tìm thấy nhân viên nào.</td></tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>{emp.employeeId}</td>
                    <td>{emp.fullName}</td>
                    <td>{emp.department}</td>
                    <td>{emp.position}</td>
                    <td>{emp.email}</td>
                    <td>{emp.phone}</td>
                    <td>{emp.status}</td>
                    <td>
                      <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(emp)}>Sửa</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(emp._id)}>Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
