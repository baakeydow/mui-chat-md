import * as React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { AppContext } from '../AppContext';
import { DtkChatUser } from '../types/DtkChatUser';
import { Container } from '@mui/material';

export default function DtkUserChannelSelection() {
  const { user, chat_data, currentSelectedUsers, setSelectedUsers } = React.useContext(AppContext);
  const [options, setOptions] = React.useState<DtkChatUser[]>(chat_data?.users.filter((u) => u.id !== user?.id) || []);
  const updateValues = (_event: any, newValue: React.SetStateAction<DtkChatUser[]>) => {
    setSelectedUsers(newValue);
  };
  React.useEffect(() => {
    setOptions(chat_data?.users.filter((u) => u.id !== user?.id) || []);
  }, [user, chat_data]);
  return (
    <Container>
      <Autocomplete
        multiple
        limitTags={2}
        id="multiple-limit-tags"
        onChange={updateValues}
        isOptionEqualToValue={(option, { name }) => option.name === name}
        options={options}
        getOptionLabel={(option) => option.name}
        value={currentSelectedUsers}
        renderInput={(params) => <TextField {...params} label="People" />}
        sx={{
          minWidth: '100px',
          backgroundColor: 'white',
          color: 'black',
          borderRadius: '5px',
          padding: '5px',
          // mt: '20px',
          mb: '20px',
        }}
      />
    </Container>
  );
}
