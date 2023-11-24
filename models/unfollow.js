import { Schema, model, models } from 'mongoose';

const UnfollowSchema = new Schema({
  followerId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Follower ID is required'],
    ref: 'User',
  },
  followingId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Following ID is required'],
    ref: 'User',
  },
  followTime: {
    type: Date,
    required: [true, 'Followed timestamp is required'],
    immutable: true,
  },
  unfollowTime: {
    type: Date,
    default: Date.now,
    required: [true, 'Unfollowed timestamp is required'],
    immutable: true,
  },
});

const Unfollow = models.Unfollow || model('Unfollow', UnfollowSchema);

export default Unfollow;
