import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, X } from 'lucide-react';
import { useArtist } from '../../lib/hooks/useArtist';
import { useStages } from '../../lib/hooks/useStages';
import { useFriends } from '../../lib/hooks/useFriends';
import { useSchedulePicks } from '../../lib/hooks/useSchedulePicks';
import { useSongs } from '../../lib/hooks/useSongs';
import { useAppStore } from '../../store/useAppStore';
import { addSchedulePick, removeSchedulePick, updateSchedulePickNote } from '../../lib/data/schedulePicks';
import { addSong, removeSong } from '../../lib/data/songs';
import { formatTime } from '../../lib/format';
import { Sheet } from '../../components/Sheet/Sheet';
import { FriendPicker } from '../../components/FriendPicker/FriendPicker';
import { AttributionTag } from '../../components/AttributionTag/AttributionTag';
import './ArtistDetail.css';

export function ArtistDetail() {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const close = () => navigate(-1);

  const artist = useArtist(artistId);
  const stages = useStages();
  const friends = useFriends();
  const { picks } = useSchedulePicks();
  const songs = useSongs(artistId ?? '');
  const activeFriendId = useAppStore((state) => state.activeFriendId);
  const setActiveFriendId = useAppStore((state) => state.setActiveFriendId);
  const [newSongTitle, setNewSongTitle] = useState('');
  const pick = artist ? picks.find((candidate) => candidate.artistId === artist.id) : undefined;
  const [noteDraft, setNoteDraft] = useState(pick?.note ?? '');

  useEffect(() => {
    if (!pick || noteDraft === (pick.note ?? '')) return;
    const timeout = window.setTimeout(() => {
      updateSchedulePickNote(pick.id, noteDraft);
    }, 400);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteDraft, pick?.id]);

  if (artist === null) {
    return <Sheet onClose={close}>{() => null}</Sheet>;
  }

  if (!artist) {
    return <Sheet onClose={close}>{() => <p>Artist not found.</p>}</Sheet>;
  }

  const stage = stages.find((candidate) => candidate.id === artist.stageId);
  const friendById = new Map(friends.map((friend) => [friend.id, friend]));
  const pickedByFriend = pick ? friendById.get(pick.addedBy) : undefined;

  async function togglePick() {
    if (!artist) return;
    if (pick) {
      await removeSchedulePick(pick.id);
      return;
    }
    if (!activeFriendId) return;
    await addSchedulePick({ artistId: artist.id, addedBy: activeFriendId });
  }

  async function handleAddSong(event: React.FormEvent) {
    event.preventDefault();
    const title = newSongTitle.trim();
    if (!title || !activeFriendId || !artist) return;
    await addSong({ artistId: artist.id, title, addedBy: activeFriendId, source: 'manual' });
    setNewSongTitle('');
  }

  return (
    <Sheet onClose={close} className="artist-detail">
      {(requestClose) => (
        <>
          <button type="button" className="artist-detail__close" onClick={requestClose} aria-label="Close">
            <X size={18} strokeWidth={2.5} />
          </button>

          <header className="artist-detail__header">
            <h2>{artist.name}</h2>
            <div className="artist-detail__meta">
              {stage && <span className="artist-detail__stage">{stage.name}</span>}
              <span className="artist-detail__time">
                {formatTime(artist.startTime)}–{formatTime(artist.endTime)}
              </span>
            </div>
          </header>

          <button
            type="button"
            className={`artist-detail__pick-toggle${pick ? ' artist-detail__pick-toggle--active' : ''}`}
            onClick={togglePick}
            disabled={!pick && !activeFriendId}
          >
            <Star key={pick ? 'on' : 'off'} className="pop-in" size={18} fill={pick ? 'var(--lolla-coral)' : 'none'} strokeWidth={2} />
            {pick ? 'On the schedule' : 'Add to schedule'}
          </button>
          {pick && pickedByFriend && (
            <p className="artist-detail__pick-attribution">
              <AttributionTag friend={pickedByFriend} />
            </p>
          )}

          {pick && (
            <div className="artist-detail__note-field">
              <label htmlFor="pick-note" className="artist-detail__note-label">
                Note (optional)
              </label>
              <input
                id="pick-note"
                type="text"
                placeholder="e.g. leaving at 7:45 for the train, or NEED to see this song!!"
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
              />
            </div>
          )}

          <section className="artist-detail__section">
            <FriendPicker friends={friends} value={activeFriendId} onChange={setActiveFriendId} label="Adding as" />
          </section>

          <section className="artist-detail__section">
            <h3>Likely Songs</h3>
            {songs.length === 0 ? (
              <p className="artist-detail__empty">No songs added yet.</p>
            ) : (
              <ul className="artist-detail__song-list">
                {songs.map((song) => (
                  <li key={song.id} className="artist-detail__song">
                    <div className="artist-detail__song-main">
                      <span className="artist-detail__song-title">{song.title}</span>
                      <AttributionTag friend={friendById.get(song.addedBy)} />
                    </div>
                    <button
                      type="button"
                      className="artist-detail__song-remove"
                      onClick={() => removeSong(song.id)}
                      aria-label={`Remove ${song.title}`}
                    >
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <form className="artist-detail__song-form" onSubmit={handleAddSong}>
              <input
                type="text"
                placeholder="Add a song…"
                value={newSongTitle}
                onChange={(event) => setNewSongTitle(event.target.value)}
              />
              <button type="submit" disabled={!newSongTitle.trim() || !activeFriendId}>
                Add
              </button>
            </form>
          </section>
        </>
      )}
    </Sheet>
  );
}
