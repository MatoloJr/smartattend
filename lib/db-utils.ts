import connectToDatabase from './db';
import User, { IUser } from '@/models/User';
import Institution, { IInstitution } from '@/models/Institution';

/**
 * Initialize database connection and register models
 */
export async function initDatabase() {
  try {
    await connectToDatabase();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// User operations
export const userService = {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  },

  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  },

  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  },
};

// Institution operations
export const institutionService = {
  async findById(id: string): Promise<IInstitution | null> {
    return Institution.findById(id);
  },

  async findByDomain(domain: string): Promise<IInstitution | null> {
    return Institution.findOne({ domain });
  },

  async create(institutionData: Partial<IInstitution>): Promise<IInstitution> {
    const institution = new Institution(institutionData);
    return institution.save();
  },

  async update(
    id: string,
    updateData: Partial<IInstitution>
  ): Promise<IInstitution | null> {
    return Institution.findByIdAndUpdate(id, updateData, { new: true });
  },
};

// Export models for direct use if needed
export { User, Institution };

export type { IUser, IInstitution };
