import {Button, Item, Picker, TextField} from '@adobe/react-spectrum';
import {useState} from 'react';
import {useSelector} from 'react-redux';
import {ActionType, showModalError, showModalSuccess} from '../../../actions/Actions';
import {
    selectAnimal,
    selectColor,
    selectInitials,
    selectToken,
    selectUserId,
    selectUsers,
    store,
} from '../../../store/Store';
import {Translations} from '../../../Translations';
import {USER_COLORS, DEFAULT_LANGUAGE} from '../../../Constants';
import {ColorCircleSelected} from './ColorCircleSelected';
import {ColorCircle} from './ColorCircle';
import {getRequestClient} from '../../../helpers/RequestHelper';
import {UserHelper} from '../../../helpers/UserHelper';


export const FormCanvas = () => {
    const token = useSelector(selectToken);

    const client = getRequestClient(token);

    const userId = useSelector(selectUserId);
    const users = useSelector(selectUsers);
    const animalDefault = useSelector(selectAnimal);
    const colorDefault = useSelector(selectColor);
    const initialsDefault = useSelector(selectInitials);

    const [avatarColor, setAvatarColor] = useState<string | undefined>(colorDefault);
    const [animal, setAnimal] = useState(animalDefault);
    const [initials, setInitials] = useState<string>(initialsDefault || '');

    const currentUser = users.find((user) => user._id === userId);
    
    const getInitialTheme = (): 'system' | 'light' | 'dark' => {
        return currentUser?.theme || 'system';
    };
    
    const [theme, setTheme] = useState<'system' | 'light' | 'dark'>(getInitialTheme());
    const defaultInitials = currentUser?.name ? UserHelper.generateDefaultInitials(currentUser.name) : '';
    
    const handleInitialsChange = (value: string) => {
        // Limite à 2 caractères et conversion en majuscules
        const cleanValue = value.replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase();
        setInitials(cleanValue);
    };

    const save = async () => {
        const user = users.find((user) => user._id === userId)!;

        if (!user) {
            return;
        }

        user.animal = animal;
        user.color = avatarColor;
        user.initials = initials.trim() || undefined;
        user.theme = theme;

        try {
            const updated = await client.updateUser(user);

            store.dispatch({
                type: ActionType.USER_SETTINGS_UPDATE,
                payload: updated,
            });

            store.dispatch(showModalSuccess(Translations.SetupChangedConfirmation[DEFAULT_LANGUAGE]));
        } catch (error) {
            console.error(error);

            store.dispatch(showModalError(error?.toString()));
        }
    };

    return (
        <div className="content-box">
            <h2>{Translations.AnimalQuestionTitle[DEFAULT_LANGUAGE]}</h2>
            <span style={{fontSize: '0.8em', display: 'block', marginBottom: '10px'}}>
        {Translations.AnimalInfoShared[DEFAULT_LANGUAGE]}
      </span>

            <div style={{marginBottom: '20px'}}>
                <div>
                    <Picker
                        selectedKey={animal}
                        aria-label={Translations.AnimalLabel[DEFAULT_LANGUAGE]}
                        defaultSelectedKey={animal}
                        onSelectionChange={(key) => {
                            if (key === null) return;
                            setAnimal(key.toString())
                        }}
                    >
                        <Item key="horse">{Translations.HorseOption[DEFAULT_LANGUAGE]}</Item>
                        <Item key="racoon">{Translations.RaccoonOption[DEFAULT_LANGUAGE]}</Item>
                        <Item key="cat">{Translations.CatOption[DEFAULT_LANGUAGE]}</Item>
                        <Item key="dog">{Translations.DogOption[DEFAULT_LANGUAGE]}</Item>
                        <Item key="bird">{Translations.BirdOption[DEFAULT_LANGUAGE]}</Item>
                        <Item key="no-answer">{Translations.NoAnswerOption[DEFAULT_LANGUAGE]}</Item>
                    </Picker>
                </div>
                {animal === 'no-answer' && (
                    <div style={{color: 'red'}}>
                        {Translations.CareerWarning[DEFAULT_LANGUAGE]}
                    </div>
                )}
            </div>
            <h2>{Translations.YourColorLabel[DEFAULT_LANGUAGE]}</h2>

            <div style={{paddingTop: '10px', display: 'flex'}}>
                {USER_COLORS.map((color) => {
                    return avatarColor === color ? (
                        <ColorCircleSelected key={color} color={color} setColor={setAvatarColor}/>
                    ) : (
                        <ColorCircle key={color} color={color} setColor={setAvatarColor}/>
                    );
                })}
            </div>

            <h2>{Translations.InitialsLabel[DEFAULT_LANGUAGE]}</h2>
            <span style={{fontSize: '0.8em', display: 'block', marginBottom: '10px'}}>
                {Translations.InitialsHelpText[DEFAULT_LANGUAGE]}
            </span>
            
            <div style={{marginBottom: '20px'}}>
                <TextField
                    value={initials}
                    onChange={handleInitialsChange}
                    onBlur={() => setInitials(initials.trim())}
                    placeholder={`${Translations.InitialsPlaceholder[DEFAULT_LANGUAGE]} (défaut: ${defaultInitials})`}
                    aria-label={Translations.InitialsLabel[DEFAULT_LANGUAGE]}
                    maxLength={2}
                    width="200px"
                />
            </div>

            <h2>{Translations.ThemeLabel[DEFAULT_LANGUAGE]}</h2>
            <div style={{marginBottom: '20px'}}>
                <Picker
                    selectedKey={theme}
                    aria-label={Translations.ThemeLabel[DEFAULT_LANGUAGE]}
                    onSelectionChange={(key) => {
                        if (key === null) return;
                        setTheme(key as 'system' | 'light' | 'dark');
                    }}
                >
                    <Item key="system">{Translations.ThemeSystemOption[DEFAULT_LANGUAGE]}</Item>
                    <Item key="light">{Translations.ThemeLightOption[DEFAULT_LANGUAGE]}</Item>
                    <Item key="dark">{Translations.ThemeDarkOption[DEFAULT_LANGUAGE]}</Item>
                </Picker>
            </div>

            <div style={{marginTop: '20px'}}>
                <Button variant="primary" onPress={save}>
                    {Translations.SaveButton[DEFAULT_LANGUAGE]}
                </Button>
            </div>
        </div>
    );
};
