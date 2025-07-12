interface OnlineUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'customer' | 'franchise';
  lastSeen: string;
  status: 'online' | 'away';
}

class HeartbeatService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly heartbeatInterval = 30000; // 30 seconds
  private readonly apiUrl = import.meta.env.VITE_SERVER;

  startHeartbeat(userId: string, userType: 'customer' | 'franchise') {
    if (this.intervalId) {
      this.stopHeartbeat();
    }

    // Send initial heartbeat
    this.sendHeartbeat(userId, userType);

    // Set up interval for periodic heartbeats
    this.intervalId = setInterval(() => {
      this.sendHeartbeat(userId, userType);
    }, this.heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async sendHeartbeat(userId: string, userType: string) {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      await fetch(`${this.apiUrl}/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          userType,
          timestamp: new Date().toISOString(),
          status: 'online'
        })
      });
    } catch (error) {
      console.error('Heartbeat failed:', error);
    }
  }

  async getOnlineUsers(): Promise<OnlineUser[]> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return [];

      const response = await fetch(`${this.apiUrl}/online-users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.users || [];
      }
    } catch (error) {
      console.error('Failed to fetch online users:', error);
    }
    return [];
  }
}

export const heartbeatService = new HeartbeatService();
export type { OnlineUser };
