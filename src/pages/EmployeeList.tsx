import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { api } from "../services/api";
import type { Employee, BasicInfo, Details } from "../types";
import "../styles/EmployeeList.css";

export const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const [basicInfoResponse, detailsResponse] = await Promise.all([
        api.getBasicInfo(),
        api.getDetails(),
      ]);

      const allMerged = mergeEmployeeData(
        basicInfoResponse.data,
        detailsResponse.data,
      );

      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const paginatedEmployees = allMerged.slice(start, end);

      setEmployees(paginatedEmployees);
      setTotalPages(Math.ceil(allMerged.length / itemsPerPage));
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const mergeEmployeeData = (
    basicInfoList: BasicInfo[],
    detailsList: Details[],
  ): Employee[] => {
    const merged: Employee[] = [];

    // Create a map of details by employeeId for quick lookup
    const detailsMap = new Map<string, Details>();
    detailsList.forEach((detail) => {
      if (detail.employeeId) {
        detailsMap.set(detail.employeeId, detail);
      }
    });

    // Merge basic info with details
    basicInfoList.forEach((basic) => {
      const detail = detailsMap.get(basic.employeeId);

      merged.push({
        name: basic.fullName,
        email: basic.email,
        department: basic.department,
        role: basic.role,
        location: detail?.officeLocation || "N/A",
        photo: detail?.photo || "",
        employeeId: basic.employeeId,
      });
    });

    // Add details that don't have matching basic info (Ops users)
    detailsList.forEach((detail) => {
      if (
        detail.employeeId &&
        !basicInfoList.find((b) => b.employeeId === detail.employeeId)
      ) {
        merged.push({
          name: "N/A",
          email: "N/A",
          department: "N/A",
          role: "Ops",
          location: detail.officeLocation || "N/A",
          photo: detail.photo || "",
          employeeId: detail.employeeId,
        });
      }
    });

    return merged;
  };

  const handleAddEmployee = () => {
    navigate("/wizard?role=admin");
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  if (loading) {
    return <div className='employee-list-loading'>Loading employees...</div>;
  }

  return (
    <div className='employee-list-container'>
      <div className='employee-list-header'>
        <h1>Employee List</h1>
        <Button onClick={handleAddEmployee}>+ Add Employee</Button>
      </div>

      {employees.length === 0 ? (
        <div className='employee-list-empty'>
          <p>No employees found. Add your first employee!</p>
        </div>
      ) : (
        <>
          <div className='employee-table-container'>
            <table className='employee-table'>
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee, index) => (
                  <tr key={`${currentPage}-${index}`}>
                    <td data-label='Photo'>
                      <img
                        src={employee.photo}
                        alt={employee.name}
                        className='employee-photo'
                      />
                    </td>
                    <td data-label='Name'>{employee.name}</td>
                    <td data-label='Department'>{employee.department}</td>
                    <td data-label='Role'>{employee.role}</td>
                    <td data-label='Location'>{employee.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='employee-list-pagination'>
            <Button
              variant='secondary'
              onClick={handlePreviousPage}
              disabled={currentPage === 1}>
              Prev
            </Button>
            <span className='pagination-info'>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant='secondary'
              onClick={handleNextPage}
              disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
