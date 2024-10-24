document.addEventListener('DOMContentLoaded', function () {
    const studentForm = document.getElementById('studentForm');
    const showFormButton = document.getElementById('showForm');
    const closeFormButton = document.getElementById('closeForm');
    const studentTableBody = document.getElementById('studentTable').querySelector('tbody');
    
    document.getElementById('searchInput').addEventListener('input', function() {
        const searchInput = document.getElementById('searchInput').value.toLowerCase(); // Get the search input
        const filteredStudents = studentsData.filter(student => 
            student.name.toLowerCase().includes(searchInput) || // Filter by name
            student.studentID.toLowerCase().includes(searchInput) // Filter by student ID
        );
        renderStudentTable(filteredStudents); // Render the filtered results
    });

    let studentsData = [];

    showFormButton.addEventListener('click', function () {
        studentForm.style.display = 'block';
    });

    closeFormButton.addEventListener('click', function () {
        studentForm.style.display = 'none';
    });

    studentForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Collect input values
        const studentID = document.getElementById('studentID').value;
        const name = document.getElementById('name').value;
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const dob = document.getElementById('dob').value;

        // Convert date format from YYYY-MM-DD to DD/MM/YYYY
        const dobParts = dob.split('-'); // Tách ngày tháng năm
        const dobConverted = `${dobParts[2]}/${dobParts[1]}/${dobParts[0]}`; // Định dạng lại thành DD/MM/YYYY

        // Create an object to send in the body
        const data = {
            studentID: studentID,
            name: name,
            gender: gender,
            dob: dobConverted
        };

        // Send the request with JSON body
        fetch(studentForm.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Set the content type to JSON
            },
            body: JSON.stringify(data) // Convert the data object to a JSON string
        }).then(response => response.text())
          .then(data => {
              alert(data);
              studentForm.reset();
              studentForm.style.display = 'none';
              fetchStudentData();
          }).catch(error => console.error('Error:', error));
    });

    function fetchStudentData() {
        fetch('http://localhost:3000/students')
            .then(response => response.json())
            .then(data => {
                studentsData = data;
                renderStudentTable();
            }).catch(error => console.error('Error:', error));
    }
    
    function renderStudentTable(filteredData = studentsData) {
        studentTableBody.innerHTML = ''; // Xóa nội dung cũ
        filteredData.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.studentID}</td>
                <td>${student.name}</td>
                <td>${student.gender}</td>
                <td>${student.dob}</td>
                <td><button class="normalButton delete-button" data-id="${student.studentID}">Delete</button></td>
            `;
            studentTableBody.appendChild(row);
        });

        // Thêm sự kiện cho các nút xóa
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', function() {
                const studentID = this.getAttribute('data-id');
                deleteStudent(studentID); // Gọi hàm xóa sinh viên
            });
        });
    }

    // Hàm xóa sinh viên
    function deleteStudent(studentID) {
        fetch(`http://localhost:3000/students/${studentID}`, {
            method: 'DELETE' // Phương thức xóa
        })
        .then(response => {
            if (response.ok) {
                studentsData = studentsData.filter(student => student.studentID !== studentID);
                renderStudentTable();
            } else {
                console.error('Error deleting student:', response.statusText);
            }
        })
        .catch(error => console.error('Error:', error));
    }

    fetchStudentData();
});