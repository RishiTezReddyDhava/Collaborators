// models/Intern.ts - FIXED VERSION
import mongoose, { Schema, models } from "mongoose";
import * as bcrypt from 'bcryptjs';

// Define the Intern Schema
const internSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['intern'],
      default: 'intern',
      required: true,
      immutable: true,
    },
    organizationName: {
      type: String,
      default: 'none',
    },
    organizationId: {
      type: String,
      default: null,
    },
    fullName: String,
    phone: String,
    skills: String,
    bio: String,
    profileImage: String,
    dob: String,
    teams: [String],
    profileSubmissionCount: {
      type: Number,
      default: 0,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },

    // Academic details
    university: String,
    degree: String,
    major: String,
    graduationYear: String,
    gpa: String,

    // Goals and Experience
    internshipGoals: String,
    previousExperience: String,
    portfolioLinks: [String],

    // Documents
    resumeFile: String,
    idDocumentFile: String,
    transcriptFiles: [String],
  
    // FIXED: Complete applicationStatus enum with "none" included
   

    // Applied internships array
    appliedInternships: [{
      internshipId: String,
      companyName: String,
      position: String,
      appliedDate: Date,
      status: {
        type: String,
        enum: ["pending", "shortlisted", "interview_scheduled", "selected", "accepted", "declined", "rejected"],
        default: "pending",
      },
      interviewDate: Date,
      notes: String,
      respondedDate: Date,
      applicationData: {
        coverLetter: String,
        whyInterestedReason: String,
        relevantExperience: String,
        expectedOutcome: String,
        availableStartDate: String,
        additionalComments: String,
      },
      userProfileSnapshot: {
        fullName: String,
        email: String,
        phone: String,
        university: String,
        degree: String,
        major: String,
        graduationYear: String,
        skills: String,
        resumeFile: String,
        gpa: String,
        portfolioLinks: [String],
        internshipGoals: String,
        previousExperience: String,
      }
    }],
    
    // Team Assignment Tracking
    assignedTeams: [{
      teamId: String,
      teamName: String,
      projectTitle: String,
      assignedDate: Date,
      status: {
        type: String,
        enum: ["active", "completed", "inactive"],
        default: "active",
      }
    }],

    // Mentors and Panelists assignments
    employees: [String],

    // Weekly Reports
    weeklyReports: [{
      weekNumber: Number,
      startDate: Date,
      endDate: Date,
      hoursWorked: Number,
      tasksCompleted: String,
      challengesFaced: String,
      nextWeekGoals: String,
      mentorFeedback: String,
      submittedDate: Date,
      status: {
        type: String,
        enum: ["pending", "active", "submitted", "reviewed"],
        default: "pending",
      },
    }],

    feedback: [{
      fromUserId: String,
      fromUserName: String,
      fromUserRole: String,
      type: {
        type: String,
        enum: ["mentor_feedback", "panelist_evaluation", "admin_review", "self_evaluation", "peer_review"],
      },
      rating: Number,
      comments: String,
      dateGiven: Date,
      relatedToWeek: Number
    }],

    // Demo Presentation Tracking
    demoScheduled: {
      type: Boolean,
      default: false,
    },
    demoDate: Date,
    demoMaterials: String,
    demoStatus: {
      type: String,
      enum: ["not_scheduled", "scheduled", "completed", "cancelled"],
      default: "not_scheduled",
    },


    // Assignments 
    assignments: [String],
    // Intern Preferences and Settings
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "light",
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      weeklyReportReminders: {
        type: Boolean,
        default: true,
      },
      teamChatNotifications: {
        type: Boolean, 
        default: true,
      },
      feedbackNotifications: {
        type: Boolean,
        default: true,
      },
    },

    // Notification system
    notifications: [{
      type: {
        type: String,
        enum: ["application_update", "team_assignment", "feedback_received", "demo_scheduled", "report_due", "general"]
      },
      title: String,
      message: String,
      read: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      relatedId: String
    }],

    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginDate: Date,
    
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { strict: false }
);

internSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.default.hash(this.password, 10);
  }
  next();
});

internSchema.pre("updateOne", function () {
  this.set({ updatedAt: new Date() });
});

const Intern = models.Intern || mongoose.model("Intern", internSchema);

export default Intern;