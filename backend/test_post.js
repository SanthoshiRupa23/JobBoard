const http = require('http');

async function testPostJob() {
    const baseUrl = 'http://localhost:8080/api';

    // 1. Auth: Login as Employer
    const loginReq = http.request(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, (res) => {
        let text = '';
        res.on('data', chunk => text += chunk);
        res.on('end', () => {
            const data = JSON.parse(text);
            const token = data.token;

            // 2. Create Job
            const jobPayload = {
                title: "Remote Test",
                description: "Test",
                location: "Test",
                type: "REMOTE",
                requirements: "",
                salaryRange: "",
                employerId: 1,
                status: "OPEN"
            };

            const postReq = http.request(`${baseUrl}/jobs`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }, (res2) => {
                let text2 = '';
                res2.on('data', chunk => text2 += chunk);
                res2.on('end', () => {
                    console.log(`Status: ${res2.statusCode}`);
                    console.log(`Response: ${text2}`);
                });
            });
            postReq.write(JSON.stringify(jobPayload));
            postReq.end();
        });
    });

    loginReq.write(JSON.stringify({
        email: 'employer1@test.com',
        password: 'Password@123'
    }));
    loginReq.end();
}

testPostJob();
