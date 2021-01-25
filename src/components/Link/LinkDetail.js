import { user } from 'firebase-functions/lib/providers/auth';
import React from 'react';
import { FirebaseContext } from '../../firebase';
import LinkItem from './LinkItem';
import { distanceInWordsToNow } from 'date-fns/distance_in_words_to_now';

function LinkDetail(props) {
  const { firebase } = React.useContext(FirebaseContext);
  const [link, setLink] = React.useState(null);
  const [commentText, setCommentText] = React.useState('');
  const linkId = props.match.params.linkId;
  const linkRef = firebase.db.collection('Links').doc(linkId);

  React.useEffect(() => {
    getLinks();
  }, []);

  function getLinks() {
    linkRef.get().then((doc) => {
      setLink({ id: doc.id, ...doc.data() });
    });
  }

  function handleAddComment() {
    if (!user) {
      props.history.push('/login');
    } else {
      linkRef.get().then((doc) => {
        if (doc.exists) {
          const previousComments = doc.data().comments;
          const comment = {
            postedBy: { id: user.uid, name: user.displayName },
            created: Date.now(),
            text: commentText,
          };
          const updatedComment = [...previousComments, comment];
          linkRef.update({ comments: updatedComment });
          setLink((previousState) => ({
            ...previousState,
            comments: updatedComment,
          }));
          setCommentText('');
        }
      });
    }
  }

  return !link ? (
    <p>Loading...</p>
  ) : (
    <div>
      <LinkItem showCount={false} link={link} />
      <textarea
        row="6"
        column="60"
        onChange={(e) => setCommentText(e.target.value)}
        value={commentText}
      />

      <div>
        <button className="button" onClick={handleAddComment}>
          Add comment
        </button>
        {link.comments.map((comment, index) => (
          <div key={index}>
            <p className="comment-author">
              {comment.postedBy.name} | {distanceInWordsToNow(comment.created)}
            </p>
            <p>{comment.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LinkDetail;
