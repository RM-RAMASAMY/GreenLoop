const SERVER_URL = 'http://localhost:3001';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${SERVER_URL}/api/user/user1`);
        const user = await response.json();

        document.getElementById('xp-display').innerText = user.totalXP;
        document.getElementById('level-display').innerText = `Level: ${user.level}`;
    } catch (error) {
        document.getElementById('xp-display').innerText = 'Error';
        console.error('Failed to fetch user stats:', error);
    }
});
