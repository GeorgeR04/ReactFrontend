import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../security/AuthContext.jsx";

const GameReviews = ({ gameId, gameName }) => {
    const { token, user } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState("");
    const [rating, setRating] = useState(5);
    const [error, setError] = useState("");
    const [showReviewForm, setShowReviewForm] = useState(false);

    console.log(user.userId)
    // On convertit l'ID utilisateur en chaîne (qu'il soit stocké dans user.userId ou user.id)
    const currentUsername = user?.username ?? null;


    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const headers = { "Content-Type": "application/json" };
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }
                const response = await fetch(`http://localhost:8080/api/games/${gameId}/reviews`, { headers });
                if (response.ok) {
                    const data = await response.json();
                    setReviews(data);
                } else {
                    setError("Impossible de récupérer les revues.");
                }
            } catch (err) {
                setError("Une erreur est survenue lors de la récupération des revues.");
            }
        };

        fetchReviews();
    }, [gameId, token]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!token) {
            setError("Vous devez être connecté pour soumettre une revue.");
            return;
        }
        // Vérification côté client : empêche la soumission si une revue existe déjà
        if (currentUsername && reviews.some(review => review.username && review.username === currentUsername)) {
            setError("Vous avez déjà soumis une revue pour ce jeu.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/api/games/${gameId}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ reviewText: newReview, rating }),
            });
            if (response.ok) {
                setNewReview("");
                setRating(5);
                setShowReviewForm(false);
                // Recharger les revues après soumission
                const headers = { "Content-Type": "application/json" };
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }
                const updatedResponse = await fetch(`http://localhost:8080/api/games/${gameId}/reviews`, { headers });
                if (updatedResponse.ok) {
                    const data = await updatedResponse.json();
                    setReviews(data);
                }
            } else {
                setError("Échec de la soumission de la revue.");
            }
        } catch (err) {
            setError("Une erreur est survenue lors de la soumission de la revue.");
        }
    };

    const deleteReview = async (reviewId) => {
        if (!token) {
            setError("Vous devez être connecté pour supprimer une revue.");
            return;
        }
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette revue ?")) {
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/api/games/reviews/${reviewId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                setReviews(reviews.filter(review => review.id !== reviewId));
            } else {
                setError("Échec de la suppression de la revue.");
            }
        } catch (err) {
            setError("Une erreur est survenue lors de la suppression de la revue.");
        }
    };

    // L'utilisateur peut écrire une revue s'il est "player" associé au jeu ou s'il est "moderator"
    const canWriteReview =
        user &&
        user.role &&
        ((user.role.toLowerCase() === "player" &&
                user.game &&
                user.game.toLowerCase() === gameName.toLowerCase()) ||
            user.role.toLowerCase() === "moderator");

    // Vérifier si l'utilisateur a déjà soumis sa revue
    const hasReviewed = currentUsername && reviews.some(
        review => review.username && review.username === currentUsername
    );

    return (
        <div className="game-reviews-section my-8">
            <h2 className="text-2xl font-bold mb-4">Revues du Jeu</h2>
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid grid-cols-1 gap-4">
                {reviews.map(review => {
                    // Le bouton de suppression s'affiche si l'utilisateur est modérateur ou si c'est son review


                    const canDelete = currentUsername && (
                        (user.role && user.role.toLowerCase() === "moderator") ||
                        (review.username && review.username === currentUsername)
                    );

                    return (
                        <div key={review.id} className="bg-white shadow rounded-lg p-4 flex items-center">
                            {review.profileImage ? (
                                <img
                                    src={`data:image/png;base64,${review.profileImage}`}
                                    alt="Profil"
                                    className="w-12 h-12 rounded-full mr-4"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
                            )}
                            <div className="flex-1">
                                <p className="font-bold text-gray-800">{review.username}</p>
                                <p className="text-sm text-gray-600">
                                    Rank: {review.rank} | Trust: {review.trustFactor}
                                </p>
                                {review.team && review.team !== "" && (
                                    <p className="text-sm text-gray-600">Team: {review.team}</p>
                                )}
                                <p className="mt-2 text-gray-700">
                                    <strong>Rating: {review.rating}</strong> - {review.reviewText}
                                </p>
                            </div>
                            {canDelete && (
                                <button
                                    onClick={() => deleteReview(review.id)}
                                    className="ml-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
                                >
                                    Supprimer
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
            {canWriteReview && !hasReviewed && (
                !showReviewForm ? (
                    <button
                        onClick={() => setShowReviewForm(true)}
                        className="mt-6 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg"
                    >
                        Écrire une revue
                    </button>
                ) : (
                    <div className="mt-6 bg-gray-100 p-4 rounded-lg shadow">
                        <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                            <textarea
                                placeholder="Écrivez votre revue ici..."
                                value={newReview}
                                onChange={e => setNewReview(e.target.value)}
                                className="p-2 border border-gray-300 rounded text-black"
                                required
                            />
                            <input
                                type="number"
                                value={rating}
                                onChange={e => setRating(e.target.value)}
                                min="1"
                                max="5"
                                className="p-2 border border-gray-300 rounded text-black"
                                required
                            />
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg"
                                >
                                    Soumettre la revue
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowReviewForm(false)}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg"
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                )
            )}
            {canWriteReview && hasReviewed && (
                <p className="mt-4 text-gray-600">Vous avez déjà soumis une revue pour ce jeu.</p>
            )}
            {!canWriteReview && (
                <p className="mt-4 text-gray-600">Vous n'êtes pas autorisé à écrire une revue pour ce jeu.</p>
            )}
        </div>
    );
};

export default GameReviews;
