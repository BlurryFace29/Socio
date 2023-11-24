'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import CardContainer from '@/components/CardContainer';
import Upload from '@/components/Upload';
import { PaperClipIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';

type UploadedFile = {
  cid: string;
  fileType: 'image' | 'video';
};

type Session = {
  user: {
    address: string;
    id: string;
    username: string;
    name?: string;
    image?: string;
  };
};

const profileSchema = z.object({
  profilePicture: z.string().url().or(z.literal('')).optional(),
  username: z.string().min(1).max(30),
  name: z.string().max(30),
  bio: z.string().max(160),
  email: z.string().email().or(z.literal('')).optional(),
  website: z.string().url().or(z.literal('')).optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

const EditProfile = () => {
  const { data: session } = (useSession() as { data: Session | null }) || {};

  const [uploadedProfilePic, setUploadedProfilePic] =
    useState<UploadedFile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      profilePicture: '',
      username: '',
      name: '',
      bio: '',
      email: '',
      website: '',
    },
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session?.user.address) {
        return;
      }

      try {
        const response = await axios.get(`/api/user/${session.user.address}`);

        const { __v, _id, address, timestamp, ...cleanedData } = response.data;
        console.log(cleanedData);

        for (const key in cleanedData) {
          if (key as keyof ProfileFormValues) {
            const value = cleanedData[key] === null ? '' : cleanedData[key];
            profileForm.setValue(key as keyof ProfileFormValues, value);
          }
        }

        if (cleanedData.profilePicture) {
          const imageUrl = cleanedData.profilePicture;
          const imageCid = imageUrl.split('/').pop();
          setUploadedProfilePic({
            cid: imageCid,
            fileType: 'image',
          });
        } else {
          setUploadedProfilePic(null);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, [session, profileForm]);

  const handleProfileSubmit = async (data: ProfileFormValues) => {
    setIsLoadingProfile(true);
    try {
      const response = await axios.post('/api/user/profile/update', { data });

      if (response.status === 200) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  return (
    <CardContainer>
      <Form {...profileForm}>
        <form
          onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
          className="space-y-4"
        >
          <FormField
            control={profileForm.control}
            name="profilePicture"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Picture</FormLabel>
                <div className="flex items-center space-x-4">
                  <FormControl>
                    <Upload
                      onFileUpload={(file) => {
                        setUploadedProfilePic(file);
                        profileForm.setValue(
                          'profilePicture',
                          `https://ivory-eligible-hamster-305.mypinata.cloud/ipfs/${file.cid}`
                        );
                      }}
                      onError={(error) => {
                        console.error('Upload Error:', error);
                      }}
                    >
                      <button
                        className="btn btn-ghost btn-circle"
                        onClick={(e) => e.preventDefault()}
                      >
                        <PaperClipIcon width={24} />
                      </button>
                    </Upload>
                  </FormControl>
                  {uploadedProfilePic &&
                    uploadedProfilePic.fileType === 'image' && (
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={`https://ivory-eligible-hamster-305.mypinata.cloud/ipfs/${uploadedProfilePic.cid}`}
                        />
                        <AvatarFallback>PFP</AvatarFallback>
                      </Avatar>
                    )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={profileForm.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="username" autoComplete="off" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={profileForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="full name"
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={profileForm.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="A brief bio"
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={profileForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="example@email.com"
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={profileForm.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://example.com"
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoadingProfile}>
            {isLoadingProfile ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </Form>
    </CardContainer>
  );
};

export default EditProfile;
