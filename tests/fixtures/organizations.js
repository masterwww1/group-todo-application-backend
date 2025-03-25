const organizations = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Test Organization 1',
      created_at: new Date('2024-01-01T00:00:00Z'),
      updated_at: new Date('2024-01-01T00:00:00Z')
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Test Organization 2',
      created_at: new Date('2024-01-01T00:00:00Z'),
      updated_at: new Date('2024-01-01T00:00:00Z')
    }
  ];
  
  const validOrganizationData = {
    name: 'New Test Organization'
  };
  
  const invalidOrganizationData = {
    name: '' // empty name for validation testing
  };
  
  module.exports = {
    organizations,
    validOrganizationData,
    invalidOrganizationData,
    
    // Helper function to get specific organization
    getOrganization: (index = 0) => ({
      ...organizations[index]
    }),
  
    // Helper function to create new organization data
    createOrganizationData: (override = {}) => ({
      ...validOrganizationData,
      ...override
    })
  };