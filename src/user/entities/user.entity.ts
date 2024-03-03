import { Schema } from 'mongoose';
import * as bcrypt from 'bcrypt';

export interface User extends Document {
    id: string;
    email: string;
    password: string;
    fullName: string;
    isActive: boolean;
    roles: string[];
    checkPassword(password: string): Promise<boolean>;
}

export const UserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    fullName: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    roles: {
        type: [String],
        default: ['USER_ROLE'],
    },
    
}, { timestamps: true , 
    versionKey: false,
});

UserSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
    }
});




UserSchema.methods.checkPassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};
