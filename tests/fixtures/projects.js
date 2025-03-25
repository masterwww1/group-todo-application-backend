const { organizations } = require('./organizations');
const { users } = require('./users');

const projects = [
  {
    id: '55555555-5555-5555-5555-555555555555',
    organization_id: organizations[0].id,
    name: 'Backend Development',
    description: 'Main backend development project',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    organization_id: organizations[0].id,
    name: 'Frontend Development',
    description: 'Main frontend development project',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    organization_id: organizations[1].id, // Different organization
    name: 'Mobile App',
    description: 'Mobile application project',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  }
];

const validProjectData = {
  name: 'New Test Project',
  description: 'This is a test project',
  organization_id: organizations[0].id
};

const invalidProjectData = {
  name: '', // empty name
  description: 'A'.repeat(1001), // too long
  organization_id: 'invalid-uuid'
};

module.exports = {
  projects,
  validProjectData,
  invalidProjectData,

  // Get project by index
  getProject: (index = 0) => ({
    ...projects[index]
  }),

  // Get project by organization
  getProjectsByOrganization: (organizationId) => 
    projects.filter(p => p.organization_id === organizationId),

  // Create new project data
  createProjectData: (override = {}) => ({
    ...validProjectData,
    name: `Test Project ${Date.now()}`, // Ensure unique name
    ...override
  }),

  // Get project with related data
  getProjectWithRelations: (index = 0) => ({
    ...projects[index],
    organization: organizations.find(
      org => org.id === projects[index].organization_id
    ),
    // Add any other related data needed for testing
  }),

  // Create multiple test projects
  createMultipleProjects: (count = 3, baseData = {}) => 
    Array.from({ length: count }, (_, i) => ({
      ...validProjectData,
      name: `Test Project ${i + 1}-${Date.now()}`,
      ...baseData
    }))
};