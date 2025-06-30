// Mock API for demonstration purposes
class MockAPI {
  constructor() {
    this.users = new Map();
    this.currentUser = null;
    this.businessTypes = [
      {
        business_type_id: '1',
        name: 'Roofing Services',
        description: 'Residential and commercial roofing installation, repair, and maintenance services',
        industry_category: 'Construction & Home Services',
        is_custom: false
      },
      {
        business_type_id: '2',
        name: 'Digital Marketing Agency',
        description: 'Full-service digital marketing including SEO, PPC, social media, and content marketing',
        industry_category: 'Marketing & Advertising',
        is_custom: false
      }
    ];
    this.targetAudiences = [
      {
        audience_id: '1',
        name: 'Homeowners',
        description: 'Residential property owners aged 25-65 interested in home improvement and maintenance',
        is_custom: false
      },
      {
        audience_id: '2',
        name: 'Small Business Owners',
        description: 'Entrepreneurs and business owners with 1-50 employees looking to grow their business',
        is_custom: false
      }
    ];
  }

  async register(email, password) {
    await this.delay(500); // Simulate network delay
    
    if (this.users.has(email)) {
      throw new Error('User with this email already exists');
    }
    
    const user = {
      user_id: Date.now().toString(),
      email,
      credit_balance: 0,
      created_at: new Date().toISOString()
    };
    
    this.users.set(email, { ...user, password });
    this.currentUser = user;
    
    return {
      message: 'User registered successfully',
      access_token: 'mock-jwt-token',
      user
    };
  }

  async login(email, password) {
    await this.delay(500);
    
    const userData = this.users.get(email);
    if (!userData || userData.password !== password) {
      throw new Error('Invalid email or password');
    }
    
    this.currentUser = { ...userData };
    delete this.currentUser.password;
    
    return {
      message: 'Login successful',
      access_token: 'mock-jwt-token',
      user: this.currentUser
    };
  }

  async getProfile() {
    await this.delay(200);
    
    if (!this.currentUser) {
      throw new Error('User not found');
    }
    
    return { user: this.currentUser };
  }

  async getBusinessTypes() {
    await this.delay(300);
    
    const userBusinessTypes = this.currentUser ? 
      this.businessTypes.filter(bt => bt.user_id === this.currentUser.user_id || !bt.user_id) :
      this.businessTypes.filter(bt => !bt.user_id);
    
    return { business_types: userBusinessTypes };
  }

  async createBusinessType(data) {
    await this.delay(400);
    
    if (!this.currentUser) {
      throw new Error('User not found');
    }
    
    const businessType = {
      business_type_id: Date.now().toString(),
      user_id: this.currentUser.user_id,
      name: data.name,
      description: data.description,
      industry_category: data.industry_category,
      is_custom: true,
      created_at: new Date().toISOString()
    };
    
    this.businessTypes.push(businessType);
    
    return {
      message: 'Business type created successfully',
      business_type: businessType
    };
  }

  async getTargetAudiences() {
    await this.delay(300);
    
    const userAudiences = this.currentUser ? 
      this.targetAudiences.filter(ta => ta.user_id === this.currentUser.user_id || !ta.user_id) :
      this.targetAudiences.filter(ta => !ta.user_id);
    
    return { target_audiences: userAudiences };
  }

  async createManualAudience(data) {
    await this.delay(400);
    
    if (!this.currentUser) {
      throw new Error('User not found');
    }
    
    const audience = {
      audience_id: Date.now().toString(),
      user_id: this.currentUser.user_id,
      name: data.name || 'Custom Audience',
      description: data.manual_description,
      manual_description: data.manual_description,
      is_custom: true,
      created_at: new Date().toISOString()
    };
    
    this.targetAudiences.push(audience);
    
    return {
      message: 'Target audience created successfully',
      target_audience: audience
    };
  }

  async getCreditPackages() {
    await this.delay(200);
    
    return {
      packages: [
        {
          id: 'starter',
          name: 'Starter Package',
          credits: 10,
          price: 15.76,
          price_per_credit: 1.58,
          description: 'Perfect for trying out the service'
        },
        {
          id: 'professional',
          name: 'Professional Package',
          credits: 50,
          price: 67.25,
          price_per_credit: 1.34,
          description: 'Great for regular users'
        },
        {
          id: 'enterprise',
          name: 'Enterprise Package',
          credits: 200,
          price: 247.48,
          price_per_credit: 1.24,
          description: 'Best for businesses'
        },
        {
          id: 'bulk',
          name: 'Bulk Package',
          credits: 500,
          price: 566.74,
          price_per_credit: 1.13,
          description: 'Maximum value for power users'
        }
      ]
    };
  }

  async getCreditBalance() {
    await this.delay(200);
    
    if (!this.currentUser) {
      throw new Error('User not found');
    }
    
    return { credit_balance: this.currentUser.credit_balance };
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new MockAPI();

