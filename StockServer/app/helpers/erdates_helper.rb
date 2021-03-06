module ErdatesHelper
  def watch? user, erdate
    if !user.nil?
      user.watchEr?(erdate)
    else
      false
    end
  end

  def beat? user, erdate
    if !user.nil? && user.beatEr?(erdate)
      user.beat_misses.where(:erdate_id => erdate.id).first.beat
    else
      0
    end
  end
end
