let studentsData = {};

function loadStudentsData() {
    let fileInput = document.getElementById('fileInput');
    let reader = new FileReader();
    reader.onload = function () {
        let lines = reader.result.split('\n');
        studentsData = {};
        for (let i = 1; i < lines.length; i++) {
            let student = lines[i].trim().split(';');
            if (student.length > 1) {
                studentsData[student[0]] = {
                    class: student[1], 
                    informatics: parseInt(student[2]),
                    physics: parseInt(student[3]),
                    mathematics: parseInt(student[4]),
                    literature: parseInt(student[5]),
                    music: parseInt(student[6])
                };
            }
        }
        displayEditTable();
        calculateStatistics();
        calculateStatisticsStudent()
    };
    reader.readAsText(fileInput.files[0], 'UTF-8');
}


function displayEditTable() {
    let table = document.getElementById('editTable');
    table.innerHTML = '';
    let header = '<tr><th>ФИО</th><th>Класс</th><th>Информатика</th><th>Физика</th><th>Математика</th><th>Литература</th><th>Музыка</th><th>Действие</th></tr>';
    table.innerHTML += header;
    for (let student in studentsData) {
        let row = '<tr>';
        row += '<td contenteditable="true">' + decodeURIComponent(student) + '</td>';
        row += '<td contenteditable="true">' + studentsData[student].class + '</td>';
        row += '<td contenteditable="true">' + studentsData[student].informatics + '</td>';
        row += '<td contenteditable="true">' + studentsData[student].physics + '</td>';
        row += '<td contenteditable="true">' + studentsData[student].mathematics + '</td>';
        row += '<td contenteditable="true">' + studentsData[student].literature + '</td>';
        row += '<td contenteditable="true">' + studentsData[student].music + '</td>';
        row += '<td><button onclick="deleteStudent(\'' + student + '\')">Удалить</button></td>';
        row += '</tr>';
        table.innerHTML += row;
    }
    document.getElementById('edit').style.display = 'block';


    let addRowButton = document.createElement('button');
    addRowButton.textContent = 'Добавить';
    addRowButton.onclick = addNewStudent;
    document.getElementById('edit').appendChild(addRowButton);
}

function deleteStudent(name) {
    delete studentsData[name];
    displayEditTable();
}

function addNewStudent() {
    let table = document.getElementById('editTable');
    let newRow = table.insertRow();
    newRow.innerHTML = '<td contenteditable="true"></td><td contenteditable="true"></td><td contenteditable="true"></td><td contenteditable="true"></td><td contenteditable="true"></td><td contenteditable="true"></td><td contenteditable="true"></td><td><button onclick="deleteRow(this)">Удалить</button></td>';


    studentsData[newRow.cells[0].innerText.trim()] = {
        class: newRow.cells[1].innerText.trim(),
        informatics: 0,
        physics: 0,
        mathematics: 0,
        literature: 0,
        music: 0
    };
}


function deleteRow(button) {
    let row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

function saveData(format) {
    let dataToSave = 'name;class;informatics;physics;mathematics;literature;music\n'; 
    let tableRows = document.getElementById('editTable').rows;
    for (let i = 1; i < tableRows.length; i++) { 
        let cells = tableRows[i].cells;
        let name = cells[0].textContent.trim();
        let studentClass = cells[1].textContent.trim();
        let informatics = parseInt(cells[2].textContent.trim());
        let physics = parseInt(cells[3].textContent.trim());
        let mathematics = parseInt(cells[4].textContent.trim());
        let literature = parseInt(cells[5].textContent.trim());
        let music = parseInt(cells[6].textContent.trim());
        if (name !== '') {
            dataToSave += name + ';' + studentClass + ';' + informatics + ';' + physics + ';' + mathematics + ';' + literature + ';' + music + '\n';
        }
    }
    let blob = new Blob([dataToSave], { type: 'text/plain' });
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'students_data.' + format;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function calculateStatistics() {
    let statistics = {};
    let classStatistics = {}; 
    let totalGrades = {}; 
    let totalStudentsCount = 0;

    for (let student in studentsData) {
        let studentClass = studentsData[student].class;
        totalStudentsCount++;
        for (let subject in studentsData[student]) {
            if (subject !== 'name' && subject !== 'class') {
                if (!statistics[subject]) {
                    statistics[subject] = {
                        average: 0,
                        count: 0,
                        grades: {}
                    };
                }
                if (!classStatistics[studentClass]) {
                    classStatistics[studentClass] = {};
                }
                if (!classStatistics[studentClass][subject]) {
                    classStatistics[studentClass][subject] = {
                        average: 0,
                        count: 0,
                        grades: {}
                    };
                }
                if (!totalGrades[subject]) {
                    totalGrades[subject] = {
                        average: 0,
                        count: 0,
                        grades: {}
                    };
                }

                let grade = studentsData[student][subject];
                
               
                statistics[subject].average += grade;
                statistics[subject].count++;
                if (!statistics[subject].grades[grade]) {
                    statistics[subject].grades[grade] = 0;
                }
                statistics[subject].grades[grade]++;

              
                classStatistics[studentClass][subject].average += grade;
                classStatistics[studentClass][subject].count++;
                if (!classStatistics[studentClass][subject].grades[grade]) {
                    classStatistics[studentClass][subject].grades[grade] = 0;
                }
                classStatistics[studentClass][subject].grades[grade]++;

         
                totalGrades[subject].average += grade;
                totalGrades[subject].count++;
                if (!totalGrades[subject].grades[grade]) {
                    totalGrades[subject].grades[grade] = 0;
                }
                totalGrades[subject].grades[grade]++;
            }
        }
    }

    let table = document.getElementById('statisticsTable');
    table.innerHTML = '';
    let header = '<tr><th>Класс</th><th>Предмет</th><th>Средний балл</th><th>Медина</th><th>Количество оценок</th></tr>';
    table.innerHTML += header;


    for (let classKey in classStatistics) {
        for (let subject in classStatistics[classKey]) {
            let grades = Object.keys(classStatistics[classKey][subject].grades).map(Number);
            grades.sort((a, b) => a - b);
            let medianIndex = Math.floor(grades.length / 2);
            let median = grades.length % 2 === 0 ? (grades[medianIndex - 1] + grades[medianIndex]) / 2 : grades[medianIndex];

            let row = '<tr>';
            row += '<td>' + classKey + '</td>';
            row += '<td>' + subject + '</td>';
            row += '<td>' + (classStatistics[classKey][subject].average / classStatistics[classKey][subject].count).toFixed(2) + '</td>';
            row += '<td>' + median + '</td>';
            row += '<td>';
            for (let grade in classStatistics[classKey][subject].grades) {
                row += grade + ': ' + ((classStatistics[classKey][subject].grades[grade] / classStatistics[classKey][subject].count) * 100).toFixed(2) + '%(' + classStatistics[classKey][subject].grades[grade] + '), ';
            }
            row = row.slice(0, -2);
            row += '</td>';
            row += '</tr>';
            table.innerHTML += row;
        }
    }


    for (let subject in totalGrades) {
        let grades = Object.keys(totalGrades[subject].grades).map(Number);
        grades.sort((a, b) => a - b);
        let medianIndex = Math.floor(grades.length / 2);
        let median = grades.length % 2 === 0 ? (grades[medianIndex - 1] + grades[medianIndex]) / 2 : grades[medianIndex];

        let row = '<tr>';
        row += '<td>All</td>';
        row += '<td>' + subject + '</td>';
        row += '<td>' + (totalGrades[subject].average / totalGrades[subject].count).toFixed(2) + '</td>';
        row += '<td>' + median + '</td>';
        row += '<td>';
        for (let grade in totalGrades[subject].grades) {
            row += grade + ': ' + ((totalGrades[subject].grades[grade] / totalGrades[subject].count) * 100).toFixed(2) + '%(' + totalGrades[subject].grades[grade] + '), ';
        }
        row = row.slice(0, -2);
        row += '</td>';
        row += '</tr>';
        table.innerHTML += row;
    }
}
function drawChart() {
    let statisticsTable = document.getElementById('statisticsTable');


    let subjects = [];
    let averageGrades = {};
    let medianGrades = {};
    let percentageGrades = {
        '2': {},
        '3': {},
        '4': {},
        '5': {}
    };

    for (let i = 1; i < statisticsTable.rows.length; i++) {
        let row = statisticsTable.rows[i];
        let className = row.cells[0].innerText.trim(); 
        let subject = row.cells[1].innerText.trim(); 
        let average = parseFloat(row.cells[2].innerText.trim()); 
        let median = parseFloat(row.cells[3].innerText.trim());
        let gradesData = row.cells[4].innerText.trim().split(', ');

      
        if (!averageGrades[className]) {
            averageGrades[className] = [];
        }
        if (!medianGrades[className]) {
            medianGrades[className] = [];
        }
        gradesData.forEach(item => {
            let [grade, percent] = item.split(':').map(entry => parseFloat(entry));
            if (!percentageGrades[grade]) {
                percentageGrades[grade] = {};
            }
            if (!percentageGrades[grade][className]) {
                percentageGrades[grade][className] = [];
            }
            percentageGrades[grade][className][subjects.indexOf(subject)] = percent;
        });

        averageGrades[className].push(average);
        medianGrades[className].push(median);

  
        if (!subjects.includes(subject)) {
            subjects.push(subject);
        }
    }


    let existingChartAverage = Chart.getChart("chart-average");
    if (existingChartAverage) {
        existingChartAverage.destroy();
    }
    let existingChartMedian = Chart.getChart("chart-median");
    if (existingChartMedian) {
        existingChartMedian.destroy();
    
    }


    let ctxAverage = document.getElementById('chart-average').getContext('2d');
    let datasetsAverage = [];
    let ctxMedian = document.getElementById('chart-median').getContext('2d');
    let datasetsMedian = [];

    let colors = ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)', 'rgba(255, 206, 86, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(153, 102, 255, 0.5)', 'rgba(255, 159, 64, 0.5)']; // Цвета для классов
    let colorIndex = 0;

    for (let className in averageGrades) {
        datasetsAverage.push({
            label: className,
            data: averageGrades[className],
            backgroundColor: colors[colorIndex % colors.length],
            borderColor: colors[colorIndex % colors.length],
            borderWidth: 1
        });
        datasetsMedian.push({
            label: className,
            data: medianGrades[className],
            backgroundColor: colors[colorIndex % colors.length],
            borderColor: colors[colorIndex % colors.length],
            borderWidth: 1
        });
        colorIndex++;
    }

    let chartAverage = new Chart(ctxAverage, {
        type: 'bar',
        data: {
            labels: subjects,
            datasets: datasetsAverage
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Средний балл'
                    }
                }
            }
        }
    });

    let chartMedian = new Chart(ctxMedian, {
        type: 'bar',
        data: {
            labels: subjects,
            datasets: datasetsMedian
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Медиана'
                    }
                }
            }
        }
    });





}
function calculateStatisticsStudent() {
    let studentsStatisticsTable = document.getElementById('studentsStatisticsTable');
    studentsStatisticsTable.style.display = 'block';

    studentsStatisticsTable.innerHTML = '';


    let header = '<tr><th>Имя ученика</th><th>Предмет</th><th>Средняя оценка</th><th>Медиана</th><th>Количество 5</th><th>Количество 4</th><th>Количество 3</th><th>Количество 2</th><th>Процент 5</th><th>Процент 4</th><th>Процент 3</th><th>Процент 2</th></tr>';
    studentsStatisticsTable.innerHTML += header;


    let studentsStatistics = {};

    for (let student in studentsData) {
        for (let subject in studentsData[student]) {
            if (subject !== 'name' && subject !== 'class') {
                let grade = studentsData[student][subject];


                if (!studentsStatistics[student]) {
                    studentsStatistics[student] = {};
                }
                if (!studentsStatistics[student][subject]) {
                    studentsStatistics[student][subject] = {
                        grades: [],
                        count5: 0,
                        count4: 0,
                        count3: 0,
                        count2: 0
                    };
                }
                studentsStatistics[student][subject].grades.push(grade);


                switch (grade) {
                    case 5:
                        studentsStatistics[student][subject].count5++;
                        break;
                    case 4:
                        studentsStatistics[student][subject].count4++;
                        break;
                    case 3:
                        studentsStatistics[student][subject].count3++;
                        break;
                    case 2:
                        studentsStatistics[student][subject].count2++;
                        break;
                    default:
                        break;
                }
            }
        }
    }


    for (let student in studentsStatistics) {
        for (let subject in studentsStatistics[student]) {
            let grades = studentsStatistics[student][subject].grades;
            let average = grades.reduce((acc, curr) => acc + curr, 0) / grades.length;
            let sortedGrades = grades.slice().sort((a, b) => a - b);
            let median = grades.length % 2 === 0 ? (sortedGrades[grades.length / 2 - 1] + sortedGrades[grades.length / 2]) / 2 : sortedGrades[Math.floor(grades.length / 2)];
            let count5 = studentsStatistics[student][subject].count5;
            let count4 = studentsStatistics[student][subject].count4;
            let count3 = studentsStatistics[student][subject].count3;
            let count2 = studentsStatistics[student][subject].count2;
            let totalCount = grades.length;
            let percent5 = (count5 / totalCount) * 100;
            let percent4 = (count4 / totalCount) * 100;
            let percent3 = (count3 / totalCount) * 100;
            let percent2 = (count2 / totalCount) * 100;

            let row = '<tr>';
            row += '<td>' + student + '</td>';
            row += '<td>' + subject + '</td>';
            row += '<td>' + average.toFixed(2) + '</td>';
            row += '<td>' + median + '</td>';
            row += '<td>' + count5 + '</td>';
            row += '<td>' + count4 + '</td>';
            row += '<td>' + count3 + '</td>';
            row += '<td>' + count2 + '</td>';
            row += '<td>' + percent5.toFixed(2) + '</td>';
            row += '<td>' + percent4.toFixed(2) + '</td>';
            row += '<td>' + percent3.toFixed(2) + '</td>';
            row += '<td>' + percent2.toFixed(2) + '</td>';
            row += '</tr>';
            studentsStatisticsTable.innerHTML += row;
        }
    }
}

function getStudentGradesData() {
    let data = [];


    let table = document.getElementById('editTable');


    for (let i = 1; i < table.rows.length; i++) {
        let row = table.rows[i];
        let studentName = row.cells[0].innerText.trim(); 
        let grades = [];


        for (let j = 2; j < row.cells.length - 1; j++) {
            let grade = parseInt(row.cells[j].innerText.trim()); 
            grades.push(grade);
        }


        data.push({
            student: studentName,
            grades: grades
        });
    }

    console.log(data);

    return data;
}
function drawstudentChart() {

    let studentGradesData = getStudentGradesData();

    let students = studentGradesData.map(entry => entry.student);
    let subjects = ['Informatics', 'Physics', 'Mathematics', 'Literature', 'Music'];

    let datasets = [];


    for (let i = 0; i < subjects.length; i++) {
        let subjectGrades = studentGradesData.map(entry => entry.grades[i]);
        datasets.push({
            label: subjects[i],
            data: subjectGrades,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        });
    }


    let existingChart = Chart.getChart("studentGradesChart");
    if (existingChart) {
        existingChart.destroy();
    }


    let ctx = document.getElementById('studentGradesChart').getContext('2d');

    let chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: students,
            datasets: datasets
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Оценка'
                    }
                }
            }
        }
    });
}


function view(el) {
    let elements = document.querySelectorAll('.content > div');
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.display = 'none';
    }
    document.getElementById(el).style.display = 'block';

  
    if (el === 'graphStatistics') {
        let graphButton = document.getElementById('graphButton');
        if (!graphButton) {
            graphButton = document.createElement('button');
            graphButton.textContent = 'Построить график';
            graphButton.onclick = drawChart;
            graphButton.id = 'graphButton';
            document.getElementById(el).appendChild(graphButton);
        }
    } else {
        let graphButton = document.getElementById('graphButton');
        if (graphButton) {
            graphButton.remove();
        }
    }
}