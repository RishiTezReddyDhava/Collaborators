import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';
import Team from '@/models/Team';

export async function POST(request: Request) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const body = await request.json();
    const { username, editTeamName, editMentors, editInterns, editPanelists, editDescription} = body;

    // Validate required fields
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    if (!editTeamName) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    if (!editMentors) {
      return NextResponse.json({ error: 'Mentors are required' }, { status: 400 });
    }

    if (!editInterns) {
      return NextResponse.json({ error: 'Interns are required' }, { status: 400 });
    }

    if (!editPanelists) {
      return NextResponse.json({ error: 'Panelists are required' }, { status: 400 });
    }

    if (!editDescription) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    // Check if the requester is an admin of the organization
    const adminUser = await User.findOne({ username, role: 'admin' }).lean();
    if (!adminUser) {
      return NextResponse.json({ error: 'Only admins can edit teams' }, { status: 403 });
    }
    const organizationId = Array.isArray(adminUser) ? adminUser[0]?.organizationId : adminUser.organizationId;
    const organizationName = Array.isArray(adminUser) ? adminUser[0]?.organizationName : adminUser.organizationName;

    // Get the existing team
    const existingTeam = await Team.findOne({ teamName: editTeamName, organizationId });
    if (!existingTeam) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Remove the team from all the users' teams
    const allUsers = [...existingTeam.mentors, ...existingTeam.panelists];
    for (const user of allUsers) {
      await User.findOneAndUpdate(
        { _id: user, organizationName },
        { $pull: { teams: existingTeam._id } },
      )
    }

    for (const intern of existingTeam.interns) {
      await Intern.findOneAndUpdate(
        { _id: intern, organizationName },
        { $pull: {teams: existingTeam._id} },
      )
    }

    
    // Get all the new Team members
    const mentorUsers = await User.find({ username: { $in: editMentors }, organizationId });
    // TODO: Need to change OrganizationName to organizationId for interns when intern onboarding process is complete
    const internUsers = await Intern.find({ username: { $in: editInterns }, organizationName });
    const panelistUsers = await User.find({ username: { $in: editPanelists }, organizationId });

    // Remove duplicates in mentors, interns, and Panelists
    const uniqueMentors = Array.from(new Set(editMentors));
    const uniqueInterns = Array.from(new Set(editInterns));
    const uniquePanelists = Array.from(new Set(editPanelists));

    // validate if the users exist in the organization
    if (mentorUsers.length !== uniqueMentors.length) return NextResponse.json({ error: 'Some mentors not found' }, { status: 400 });
    if (internUsers.length !== uniqueInterns.length) return NextResponse.json({ error: 'Some interns not found' }, { status: 400 });
    if (panelistUsers.length !== uniquePanelists.length) return NextResponse.json({ error: 'Some panelists not found' }, { status: 400 });

    // Create the updated team data
    const teamData = {
      teamName: editTeamName,
      mentors: mentorUsers.map(u => u._id),
      interns: internUsers.map(u => u._id),
      panelists: panelistUsers.map(u => u._id),
      description: editDescription,
      organizationId,
    };


    // Update the team in the database
    const updatedTeam = await Team.findOneAndUpdate(
      { teamName: editTeamName, organizationId },
      teamData,
    );
    if (!updatedTeam) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // push the team into the new team members' teams array
    const newTeamMembers = [...mentorUsers, ...panelistUsers];
    for (const user of newTeamMembers) {
      await User.findOneAndUpdate(
        { username: user.username, organizationName },
        { $addToSet: { teams: updatedTeam._id } },
      );
    }

    for (const intern of internUsers) {
      await Intern.findOneAndUpdate(
        { username: intern.username, organizationName },
        { $addToSet: { teams: updatedTeam._id } },
      );
    }

    return NextResponse.json({ message: 'Team updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
