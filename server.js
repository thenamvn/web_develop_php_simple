const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Import the cors middleware
const fastcsv = require('fast-csv'); // Import fast-csv
const { writeFile } = require('fs').promises; // Sử dụng promises để ghi file

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
// Đường dẫn đến file CSV
const filePath = path.join(__dirname, 'MOCK_DATA.csv');

// Đọc dữ liệu từ file CSV
app.get('/students', (req, res) => {
    const results = [];
    fs.createReadStream(filePath)
        .pipe(fastcsv.parse({ headers: true })) // Use fast-csv to parse
        .on('data', row => results.push(row))
        .on('end', () => {
            res.json(results);
        })
        .on('error', err => {
            console.error('Error reading file:', err);
            res.status(500).send('Error reading file');
        });
});

// Route để lưu dữ liệu vào CSV
app.post('/save-csv', async (req, res) => {
    const { studentID, name, gender, dob } = req.body;
    console.log('Received data:', studentID, name, gender, dob);

    // Kiểm tra xem dữ liệu có hợp lệ không
    if (!studentID || !name || !gender || !dob) {
        return res.status(400).send('Invalid data'); // Trả về lỗi nếu dữ liệu không hợp lệ
    }

    // Nội dung CSV
    const csvContent = `${studentID},${name},${gender},${dob}\n`;

    try {
        // Kiểm tra xem file đã tồn tại chưa
        await fs.promises.access(filePath);
        // Nếu file đã tồn tại, chỉ cần thêm dữ liệu
        await fs.promises.appendFile(filePath, csvContent, 'utf8');
        res.send('Add student successfully');
    } catch (err) {
        // Nếu file không tồn tại, ghi tiêu đề vào file
        const header = 'studentID,name,gender,dob\n';
        await writeFile(filePath, header + csvContent, 'utf8');
        res.send('Add student successfully');
    }
});

// Route để xóa sinh viên
app.delete('/students/:studentID', async (req, res) => {
    const studentID = req.params.studentID;
    const results = [];

    try {
        const data = await fs.promises.readFile(filePath, 'utf8');

        // Sử dụng fast-csv để xử lý dữ liệu
        fastcsv
            .parseString(data, { headers: true })
            .on('data', row => {
                if (row.studentID !== studentID) {
                    results.push(row); // Giữ lại các dòng không có studentID cần xóa
                }
            })
            .on('end', async () => {
                // Ghi lại nội dung mới vào file CSV
                const newCsvContent = [
                    Object.keys(results[0]).join(','), // Lưu tiêu đề
                    ...results.map(row => Object.values(row).join(','))
                ].join('\n');
                
                await fs.promises.writeFile(filePath, newCsvContent, 'utf8');
                res.send('Student deleted successfully');
            });
    } catch (err) {
        console.error('Error processing file:', err);
        res.status(500).send('Error processing file');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});