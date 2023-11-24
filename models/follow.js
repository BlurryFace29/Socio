import { Schema, model, models } from 'mongoose';

const FollowSchema = new Schema({
  followerId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Follower ID is required'],
    ref: 'User',
    index: true,
  },
  followingId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Following ID is required'],
    ref: 'User',
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: [true, 'Time is required'],
    immutable: true,
  },
});

FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

const Follow = models.Follow || model('Follow', FollowSchema);

export default Follow;
