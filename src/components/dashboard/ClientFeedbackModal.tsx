import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Star, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ClientFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: {
    id: string;
    name: string;
  };
  feedbackType: 'removal' | 'deal_closure';
  onSuccess?: () => void;
}

const RatingStars = ({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (val: number) => void;
  label: string;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
            star <= value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {star}
        </button>
      ))}
    </div>
  </div>
);

const ClientFeedbackModal = ({
  open,
  onOpenChange,
  company,
  feedbackType,
  onSuccess,
}: ClientFeedbackModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    overall_rating: 0,
    communication_rating: 0,
    response_time_rating: 0,
    professionalism_rating: 0,
    would_recommend: null as boolean | null,
    competitor_name: '',
    improvement_suggestions: '',
    additional_comments: '',
    deal_value: '',
    is_repeat_customer: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Insert feedback
      const { error: feedbackError } = await supabase.from('client_feedback').insert({
        company_id: company.id,
        user_id: user.id,
        feedback_type: feedbackType,
        reason: formData.reason || null,
        overall_rating: formData.overall_rating || null,
        communication_rating: formData.communication_rating || null,
        response_time_rating: formData.response_time_rating || null,
        professionalism_rating: formData.professionalism_rating || null,
        would_recommend: formData.would_recommend,
        competitor_name: formData.competitor_name || null,
        improvement_suggestions: formData.improvement_suggestions || null,
        additional_comments: formData.additional_comments || null,
        deal_value: formData.deal_value || null,
        is_repeat_customer: formData.is_repeat_customer,
      });

      if (feedbackError) throw feedbackError;

      // Update company status
      const newStatus = feedbackType === 'removal' ? 'removed' : 'deal_closed';
      const { error: updateError } = await supabase
        .from('companies')
        .update({ status: newStatus })
        .eq('id', company.id);

      if (updateError) throw updateError;

      toast({
        title: 'Feedback submitted',
        description:
          feedbackType === 'removal'
            ? 'Client has been removed from your list.'
            : 'Deal closure recorded successfully!',
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isRemoval = feedbackType === 'removal';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isRemoval ? (
              <>
                <ThumbsDown className="text-destructive" size={20} />
                Remove Client: {company.name}
              </>
            ) : (
              <>
                <Star className="text-primary" size={20} />
                Close Deal: {company.name}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isRemoval
              ? 'Please provide feedback to help us understand why this client is being removed.'
              : 'Congratulations on closing this deal! Please share your experience.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              {isRemoval ? 'Reason for removal *' : 'How was the deal finalized?'}
            </Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder={
                isRemoval
                  ? 'e.g., Client chose another vendor, budget constraints...'
                  : 'Describe how the deal was closed...'
              }
              rows={3}
              required={isRemoval}
            />
          </div>

          {/* Competitor (for removal) */}
          {isRemoval && (
            <div className="space-y-2">
              <Label htmlFor="competitor">Which competitor did they choose? (optional)</Label>
              <Input
                id="competitor"
                value={formData.competitor_name}
                onChange={(e) => setFormData({ ...formData, competitor_name: e.target.value })}
                placeholder="Competitor name"
              />
            </div>
          )}

          {/* Deal Value (for closure) */}
          {!isRemoval && (
            <div className="space-y-2">
              <Label htmlFor="deal_value">Deal Value</Label>
              <Input
                id="deal_value"
                value={formData.deal_value}
                onChange={(e) => setFormData({ ...formData, deal_value: e.target.value })}
                placeholder="e.g., ₹25 Lakhs"
              />
            </div>
          )}

          {/* Ratings */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium">Rate Your Experience</h4>
            <RatingStars
              label="Overall Rating"
              value={formData.overall_rating}
              onChange={(val) => setFormData({ ...formData, overall_rating: val })}
            />
            <RatingStars
              label="Communication"
              value={formData.communication_rating}
              onChange={(val) => setFormData({ ...formData, communication_rating: val })}
            />
            <RatingStars
              label="Response Time"
              value={formData.response_time_rating}
              onChange={(val) => setFormData({ ...formData, response_time_rating: val })}
            />
            <RatingStars
              label="Professionalism"
              value={formData.professionalism_rating}
              onChange={(val) => setFormData({ ...formData, professionalism_rating: val })}
            />
          </div>

          {/* Would Recommend */}
          <div className="space-y-2">
            <Label>Would you work with this client again?</Label>
            <RadioGroup
              value={
                formData.would_recommend === null
                  ? ''
                  : formData.would_recommend
                  ? 'yes'
                  : 'no'
              }
              onValueChange={(val) =>
                setFormData({ ...formData, would_recommend: val === 'yes' })
              }
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="recommend_yes" />
                <Label htmlFor="recommend_yes" className="flex items-center gap-1 cursor-pointer">
                  <ThumbsUp size={16} className="text-accent" /> Yes
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="recommend_no" />
                <Label htmlFor="recommend_no" className="flex items-center gap-1 cursor-pointer">
                  <ThumbsDown size={16} className="text-destructive" /> No
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Repeat Customer */}
          {!isRemoval && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="repeat_customer"
                checked={formData.is_repeat_customer}
                onChange={(e) =>
                  setFormData({ ...formData, is_repeat_customer: e.target.checked })
                }
                className="rounded border-border"
              />
              <Label htmlFor="repeat_customer">This is a repeat customer</Label>
            </div>
          )}

          {/* Improvement Suggestions */}
          <div className="space-y-2">
            <Label htmlFor="improvements">Suggestions for improvement</Label>
            <Textarea
              id="improvements"
              value={formData.improvement_suggestions}
              onChange={(e) =>
                setFormData({ ...formData, improvement_suggestions: e.target.value })
              }
              placeholder="What could have been done better?"
              rows={2}
            />
          </div>

          {/* Additional Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments">Additional Comments</Label>
            <Textarea
              id="comments"
              value={formData.additional_comments}
              onChange={(e) =>
                setFormData({ ...formData, additional_comments: e.target.value })
              }
              placeholder="Any other feedback..."
              rows={2}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={isRemoval ? 'destructive' : 'hero'}
              disabled={loading || (isRemoval && !formData.reason)}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {isRemoval ? 'Remove Client' : 'Close Deal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientFeedbackModal;
