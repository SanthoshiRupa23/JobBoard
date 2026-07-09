const http = require('http');

async function testApi() {
    const baseUrl = 'http://localhost:8080/api';
    console.log('🚀 Starting API Tests...\n');

    // Helper for requests
    async function request(endpoint, method = 'GET', body = null, token = null) {
        const url = `${baseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        return new Promise((resolve) => {
            const req = http.request(url, options, (res) => {
                let text = '';
                res.on('data', chunk => text += chunk);
                res.on('end', () => {
                    let data = text;
                    try { data = JSON.parse(text); } catch(e) {}
                    resolve({ status: res.statusCode, data });
                });
            });
            req.on('error', (error) => resolve({ status: 500, error: error.message }));
            if (body) req.write(JSON.stringify(body));
            req.end();
        });
    }

    // 1. Auth: Login as Employer
    console.log('1. Testing Employer Login (POST /api/auth/login)');
    const loginRes = await request('/auth/login', 'POST', {
        email: 'employer1@test.com',
        password: 'Password@123'
    });
    
    if (loginRes.status !== 200) {
        console.error('❌ Login failed:', loginRes);
        return;
    }
    console.log('✅ Login successful');
    const token = loginRes.data.token;

    // 2. Profile: Get Employer Profile
    console.log('\n2. Testing Get Profile (GET /api/users/profile)');
    const profileRes = await request('/users/profile', 'GET', null, token);
    if (profileRes.status === 200 && profileRes.data.email === 'employer1@test.com') {
        console.log('✅ Profile fetched successfully');
    } else {
        console.error('❌ Profile fetch failed:', profileRes);
    }

    // 3. Jobs: Create Job
    console.log('\n3. Testing Create Job (POST /api/jobs)');
    const createJobRes = await request('/jobs', 'POST', {
        title: 'Backend Node.js Engineer',
        description: 'Great backend role.',
        location: 'Remote',
        type: 'FULL_TIME',
        requirements: 'Node.js, Express',
        salaryRange: '$120k - $140k'
    }, token);

    let jobId = null;
    if (createJobRes.status === 200) {
        console.log('✅ Job created successfully:', createJobRes.data.title);
        jobId = createJobRes.data.id;
    } else {
        console.error('❌ Create Job failed:', createJobRes);
    }

    // 4. Jobs: Get Open Jobs
    console.log('\n4. Testing Get Open Jobs (GET /api/jobs)');
    const getJobsRes = await request('/jobs?page=0&size=10', 'GET');
    if (getJobsRes.status === 200 && getJobsRes.data.content && getJobsRes.data.content.length > 0) {
        console.log(`✅ Found ${getJobsRes.data.totalElements} open jobs`);
    } else {
        console.error('❌ Get Open Jobs failed:', getJobsRes);
    }

    // 5. Auth: Login as Seeker
    console.log('\n5. Testing Seeker Login (POST /api/auth/login)');
    const seekerLoginRes = await request('/auth/login', 'POST', {
        email: 'seeker1@test.com',
        password: 'Password@123'
    });
    
    if (seekerLoginRes.status === 200) {
        console.log('✅ Seeker Login successful');
        const seekerToken = seekerLoginRes.data.token;

        // 6. Applications: Apply for Job
        if (jobId) {
            console.log(`\n6. Testing Job Application (POST /api/applications) for job ${jobId}`);
            const applyRes = await request(`/applications`, 'POST', {
                jobId: jobId,
                coverLetter: 'I am very interested.'
            }, seekerToken);
            
            if (applyRes.status === 200 || applyRes.status === 201) {
                console.log('✅ Job Application successful');
            } else {
                console.warn('⚠️ Job Application failed (endpoint might be different or require resume):', applyRes.status, applyRes.data.message || applyRes.data);
            }
        }
    } else {
        console.error('❌ Seeker Login failed:', seekerLoginRes);
    }

    console.log('\n🎉 API Testing Complete!');
}

testApi();
