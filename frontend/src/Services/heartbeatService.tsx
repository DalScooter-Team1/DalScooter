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
  private isPaused = false;
  private currentUserId: string | null = null;
  private currentUserType: 'customer' | 'franchise' | null = null;

  constructor() {
    this.setupVisibilityHandler();
  }

  // Setup page visibility handler to pause/resume heartbeat
  private setupVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseHeartbeat();
      } else {
        this.resumeHeartbeat();
      }
    });
  }

  private pauseHeartbeat() {
    this.isPaused = true;
    console.log('Heartbeat paused (tab not visible)');
  }

  private resumeHeartbeat() {
    if (this.isPaused && this.currentUserId && this.currentUserType) {
      this.isPaused = false;
      console.log('Heartbeat resumed (tab visible)');
      // Send immediate heartbeat when resuming
      this.sendHeartbeat(this.currentUserId, this.currentUserType);
    }
  }

  // Start heartbeat automatically based on user role
  startHeartbeatIfCustomer() {
    try {
      const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
      
      // Only start heartbeat for customers, not franchise/admin users
      if (userRoles.includes('customers')) {
        const decodedToken = JSON.parse(localStorage.getItem('decodedToken') || '{}');
        const userId = decodedToken.sub || decodedToken.email || 'unknown';
        
        console.log('Starting heartbeat for customer:', userId);
        this.startHeartbeat(userId, 'customer');
      } else {
        console.log('User is not a customer, heartbeat not started');
      }
    } catch (error) {
      console.error('Error checking user role for heartbeat:', error);
    }
  }

  startHeartbeat(userId: string, userType: 'customer' | 'franchise') {
    if (this.intervalId) {
      this.stopHeartbeat();
    }

    this.currentUserId = userId;
    this.currentUserType = userType;
    this.isPaused = false;

    // Send initial heartbeat
    this.sendHeartbeat(userId, userType);

    // Set up interval for periodic heartbeats
    this.intervalId = setInterval(() => {
      if (!this.isPaused) {
        this.sendHeartbeat(userId, userType);
      }
    }, this.heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.currentUserId = null;
      this.currentUserType = null;
      this.isPaused = false;
      console.log('Heartbeat stopped');
    }
  }

  private async sendHeartbeat(userId: string, userType: string) {
    try {
      // Use accessToken for customer authentication (as per the API Gateway configuration)
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('No access token found, stopping heartbeat');
        this.stopHeartbeat();
        return;
      }

      const response = await fetch(`${this.apiUrl}/heartbeat`, {
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

      if (response.ok) {
        console.log('Heartbeat sent successfully');
      } else {
        console.error('Heartbeat failed with status:', response.status);
        if (response.status === 401) {
          console.warn('Unauthorized, stopping heartbeat');
          this.stopHeartbeat();
        }
      }
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
