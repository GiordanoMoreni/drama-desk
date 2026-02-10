import { StudentService } from '../services/student-service';
import { ClassService } from '../services/class-service';
import { ShowService } from '../services/show-service';

export interface DashboardData {
  totalStudents: number;
  activeClasses: number;
  upcomingShows: number;
  studentStats: {
    totalActive: number;
    byGrade: Record<string, number>;
  };
  classStats: {
    totalActive: number;
    totalEnrollments: number;
  };
  showStats: {
    totalActive: number;
    planningShows: number;
    rehearsingShows: number;
    performingShows: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'student_added' | 'class_created' | 'show_scheduled' | 'student_enrolled' | 'role_created' | 'casting_assigned';
    title: string;
    timestamp: Date;
  }>;
}

export class GetDashboardDataUseCase {
  constructor(
    private studentService: StudentService,
    private classService: ClassService,
    private showService: ShowService
  ) {}

  async execute(organizationId: string): Promise<DashboardData> {
    console.log('=== DASHBOARD USE CASE DEBUG ===');
    console.log('Organization ID:', organizationId);

    try {
      // Get student statistics
      console.log('Getting student statistics...');
      const studentStats = await this.studentService.getStudentStats(organizationId);
      console.log('Student stats retrieved:', studentStats);

      // Get class statistics
      console.log('Getting active classes...');
      const activeClasses = await this.classService.getActiveClasses(organizationId);
      console.log('Active classes retrieved:', activeClasses.length);

      console.log('Calculating class stats...');
      const classStats = await this.calculateClassStats(organizationId, activeClasses);
      console.log('Class stats calculated:', classStats);

      // Get show statistics
      console.log('Getting active shows...');
      const activeShows = await this.showService.getActiveShows(organizationId);
      console.log('Active shows retrieved:', activeShows.length);

      console.log('Getting show stats...');
      const showStats = await this.getShowStats(activeShows);
      console.log('Show stats calculated:', showStats);

      // Get recent activity
      console.log('Getting recent activity...');
      const recentActivity = await this.getRecentActivity(organizationId);
      console.log('Recent activity retrieved:', recentActivity.length);

      console.log('=== DASHBOARD USE CASE COMPLETED ===');

      return {
        totalStudents: studentStats.totalActive,
        activeClasses: activeClasses.length,
        upcomingShows: activeShows.length,
        studentStats,
        classStats,
        showStats,
        recentActivity,
      };
    } catch (error) {
      console.error('=== DASHBOARD USE CASE ERROR ===');
      console.error('Error in dashboard use case:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }

  private async calculateClassStats(organizationId: string, activeClasses: any[]) {
    // Calculate total enrollments across all classes
    const totalEnrollments = await this.classService.getTotalEnrollments(organizationId);

    return {
      totalActive: activeClasses.length,
      totalEnrollments,
    };
  }

  private async getShowStats(shows: any[]) {
    const planning = shows.filter(s => s.status === 'planning').length;
    const rehearsing = shows.filter(s => s.status === 'rehearsing').length;
    const performing = shows.filter(s => s.status === 'performing').length;

    return {
      totalActive: shows.length,
      planningShows: planning,
      rehearsingShows: rehearsing,
      performingShows: performing,
    };
  }

  private async getRecentActivity(organizationId: string): Promise<DashboardData['recentActivity']> {
    const activities: DashboardData['recentActivity'] = [];

    try {
      // Get recent students (last 10)
      const students = await this.studentService.getStudents(organizationId, {}, { limit: 10 });
      students.data.forEach(student => {
        activities.push({
          id: `student-${student.id}`,
          type: 'student_added',
          title: `Aggiunto studente: ${student.firstName} ${student.lastName}`,
          timestamp: student.createdAt,
        });
      });

      // Get recent classes (last 10)
      const classes = await this.classService.getClasses(organizationId, {}, { limit: 10 });
      classes.data.forEach(classData => {
        activities.push({
          id: `class-${classData.id}`,
          type: 'class_created',
          title: `Creata classe: "${classData.name}"`,
          timestamp: classData.createdAt,
        });
      });

      // Get recent shows (last 10)
      const shows = await this.showService.getShows(organizationId, {}, { limit: 10 });
      shows.data.forEach(show => {
        activities.push({
          id: `show-${show.id}`,
          type: 'show_scheduled',
          title: `Programmato spettacolo: "${show.title}"`,
          timestamp: show.createdAt,
        });
      });

      // Sort by timestamp (most recent first) and take top 20
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 20);

    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }
}
