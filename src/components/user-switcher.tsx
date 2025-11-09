"use client";

import type { FC } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { USERS } from "@/lib/constants";
import type { UserID } from "@/lib/types";
import { User } from "lucide-react";

interface UserSwitcherProps {
  activeUser: UserID;
  onUserChange: (userId: UserID) => void;
}

const UserSwitcher: FC<UserSwitcherProps> = ({ activeUser, onUserChange }) => {
  return (
    <Tabs value={activeUser} onValueChange={(value) => onUserChange(value as UserID)}>
      <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-2">
        {USERS.map((user) => (
          <TabsTrigger key={user.id} value={user.id} className="gap-2">
            <User className="h-4 w-4" />
            {user.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default UserSwitcher;
